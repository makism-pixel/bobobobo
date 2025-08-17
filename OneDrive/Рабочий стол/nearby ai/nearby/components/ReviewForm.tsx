import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    Modal,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface ReviewFormProps {
    placeId: string;
    placeName: string;
    visible: boolean;
    onClose: () => void;
    onReviewAdded: () => void;
}

export default function ReviewForm({ placeId, placeName, visible, onClose, onReviewAdded }: ReviewFormProps) {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setRating(5);
        setComment('');
    };

    const submitReview = async () => {
        if (!user) {
            Alert.alert('Ошибка', 'Необходимо войти в аккаунт для написания отзыва');
            return;
        }

        if (comment.trim().length < 10) {
            Alert.alert('Ошибка', 'Отзыв должен содержать минимум 10 символов');
            return;
        }

        setLoading(true);
        try {
            const reviewData = {
                placeId: placeId,
                placeName: placeName,
                userId: user.uid,
                userEmail: user.email || 'Анонимный пользователь',
                userName: user.displayName || user.email?.split('@')[0] || 'Пользователь',
                rating: rating,
                comment: comment.trim(),
                timestamp: new Date(),
                status: 'pending', // pending, approved, rejected
                isVisible: false, // Изначально скрыт до модерации
                moderatorNote: null
            };

            // 1. Сохраняем отзыв в коллекцию reviews
            const reviewDoc = await addDoc(collection(db, 'reviews'), reviewData);
            console.log('✅ Review saved to reviews collection:', reviewDoc.id);

            // 2. Добавляем ID отзыва в массив reviews заведения (для быстрого доступа)
            const placeRef = doc(db, 'approvedPlaces', placeId);
            await updateDoc(placeRef, {
                reviewIds: arrayUnion(reviewDoc.id),
                lastReviewDate: new Date()
            });

            // 3. Уведомляем админов о новом отзыве (добавляем в коллекцию notifications)
            await addDoc(collection(db, 'adminNotifications'), {
                type: 'new_review',
                title: 'Новый отзыв требует модерации',
                message: `Пользователь ${reviewData.userName} оставил отзыв для ${placeName}`,
                placeId: placeId,
                reviewId: reviewDoc.id,
                timestamp: new Date(),
                isRead: false,
                priority: 'medium'
            });

            Alert.alert(
                'Отзыв отправлен! 📝',
                'Ваш отзыв отправлен на модерацию и появится после проверки администратором.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            resetForm();
                            onClose();
                            onReviewAdded();
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('❌ Error submitting review:', error);
            Alert.alert('Ошибка', 'Не удалось отправить отзыв. Попробуйте еще раз.');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = () => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        style={styles.starButton}
                        onPress={() => setRating(star)}
                    >
                        <Text style={[
                            styles.star,
                            { color: star <= rating ? '#FFD700' : '#E5E5EA' }
                        ]}>
                            ⭐
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Написать отзыв</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Place Info */}
                    <View style={styles.placeInfo}>
                        <Text style={styles.placeName}>📍 {placeName}</Text>
                        <Text style={styles.placeSubtitle}>Ваше мнение поможет другим посетителям</Text>
                    </View>

                    {/* Rating */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Оценка</Text>
                        {renderStars()}
                        <Text style={styles.ratingText}>
                            {rating === 1 && "😞 Очень плохо"}
                            {rating === 2 && "😕 Плохо"}
                            {rating === 3 && "😐 Нормально"}
                            {rating === 4 && "😊 Хорошо"}
                            {rating === 5 && "😍 Отлично"}
                        </Text>
                    </View>

                    {/* Comment */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ваш отзыв</Text>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Расскажите о своем опыте посещения..."
                            placeholderTextColor="#8E8E93"
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            numberOfLines={6}
                            maxLength={500}
                            textAlignVertical="top"
                        />
                        <Text style={styles.charCount}>
                            {comment.length}/500 символов
                        </Text>
                    </View>

                    {/* Guidelines */}
                    <View style={styles.guidelines}>
                        <Text style={styles.guidelinesTitle}>💡 Советы для хорошего отзыва:</Text>
                        <Text style={styles.guideline}>• Опишите свои впечатления от еды и сервиса</Text>
                        <Text style={styles.guideline}>• Упомяните атмосферу и чистоту заведения</Text>
                        <Text style={styles.guideline}>• Будьте честными и конструктивными</Text>
                        <Text style={styles.guideline}>• Избегайте нецензурной лексики</Text>
                    </View>
                </ScrollView>

                {/* Submit Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (loading || comment.trim().length < 10) && styles.disabledButton
                        ]}
                        onPress={submitReview}
                        disabled={loading || comment.trim().length < 10}
                    >
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                                <Text style={styles.submitButtonText}>Отправка...</Text>
                            </View>
                        ) : (
                            <Text style={styles.submitButtonText}>📝 Отправить отзыв</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: '#8E8E93',
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
    },
    placeholder: {
        width: 32,
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },

    // Place Info
    placeInfo: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginVertical: 20,
        alignItems: 'center',
    },
    placeName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 8,
        textAlign: 'center',
    },
    placeSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Section
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 16,
    },

    // Stars
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
    },
    starButton: {
        padding: 8,
    },
    star: {
        fontSize: 32,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 8,
    },

    // Comment
    commentInput: {
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1D1D1F',
        minHeight: 120,
        backgroundColor: '#F9F9F9',
    },
    charCount: {
        fontSize: 12,
        color: '#8E8E93',
        textAlign: 'right',
        marginTop: 8,
    },

    // Guidelines
    guidelines: {
        backgroundColor: '#F0F9FF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#0EA5E9',
    },
    guidelinesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0C4A6E',
        marginBottom: 8,
    },
    guideline: {
        fontSize: 13,
        color: '#0C4A6E',
        marginBottom: 4,
        lineHeight: 18,
    },

    // Footer
    footer: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    submitButton: {
        backgroundColor: '#8B1538',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#8B1538',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#C7C7CC',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
}); 