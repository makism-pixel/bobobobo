import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Alert,
    Dimensions,
    PanResponder,
    Animated
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

const { width: screenWidth } = Dimensions.get('window');
const CANVAS_WIDTH = screenWidth - 48;
const CANVAS_HEIGHT = 400;
const GRID_SIZE = 20;

// Типы мебели
const FURNITURE_TYPES = {
    // Столы
    table_round_2: { emoji: '⭕', name: 'Круглый стол (2 места)', size: 30, color: '#8B4513', capacity: 2, rotatable: false },
    table_round_4: { emoji: '⭕', name: 'Круглый стол (4 места)', size: 40, color: '#8B4513', capacity: 4, rotatable: false },
    table_round_6: { emoji: '⭕', name: 'Круглый стол (6 мест)', size: 50, color: '#8B4513', capacity: 6, rotatable: false },
    table_square_2: { emoji: '⬜', name: 'Квадратный стол (2 места)', size: 30, color: '#8B4513', capacity: 2, rotatable: true },
    table_square_4: { emoji: '⬜', name: 'Квадратный стол (4 места)', size: 40, color: '#8B4513', capacity: 4, rotatable: true },
    table_rect_6: { emoji: '⬛', name: 'Прямоугольный стол (6 мест)', size: 60, width: 40, color: '#8B4513', capacity: 6, rotatable: true },
    table_rect_8: { emoji: '⬛', name: 'Прямоугольный стол (8 мест)', size: 80, width: 40, color: '#8B4513', capacity: 8, rotatable: true },

    // Сидения
    chair: { emoji: '💺', name: 'Стул', size: 20, color: '#654321', rotatable: true },
    chair_bar: { emoji: '🪑', name: 'Барный стул', size: 20, color: '#654321', rotatable: true },
    sofa_small: { emoji: '🛋️', name: 'Диван (2 места)', size: 40, width: 20, color: '#4169E1', capacity: 2, rotatable: true },
    sofa_large: { emoji: '🛋️', name: 'Диван (3 места)', size: 60, width: 20, color: '#4169E1', capacity: 3, rotatable: true },

    // Барная зона
    bar_straight: { emoji: '🍺', name: 'Барная стойка (прямая)', size: 80, width: 30, color: '#2F4F4F', rotatable: true },
    bar_corner: { emoji: '🍺', name: 'Барная стойка (угловая)', size: 60, width: 60, color: '#2F4F4F', rotatable: true },
    bar_curved: { emoji: '🍺', name: 'Барная стойка (изогнутая)', size: 100, width: 30, color: '#2F4F4F', rotatable: true },

    // Декор и оборудование
    plant_small: { emoji: '🪴', name: 'Растение (малое)', size: 20, color: '#228B22', rotatable: false },
    plant_large: { emoji: '🌳', name: 'Растение (большое)', size: 40, color: '#228B22', rotatable: false },
    heater: { emoji: '🔥', name: 'Обогреватель', size: 35, color: '#FF4500', rotatable: false },
    umbrella: { emoji: '☂️', name: 'Зонт от солнца', size: 60, color: '#4682B4', rotatable: false },
    fence: { emoji: '🚧', name: 'Ограждение', size: 40, width: 10, color: '#A0522D', rotatable: true },
    stage: { emoji: '🎭', name: 'Сцена', size: 100, width: 60, color: '#8B008B', rotatable: true },
    dj: { emoji: '🎧', name: 'DJ-стойка', size: 40, width: 20, color: '#4B0082', rotatable: true },
};

interface FurnitureItem {
    id: string;
    type: keyof typeof FURNITURE_TYPES;
    x: number;
    y: number;
    rotation: number;
    width?: number;
    selected?: boolean;
    locked?: boolean;
    group?: string;
}

interface LayoutData {
    name: string;
    width: number;
    height: number;
    furniture: FurnitureItem[];
    features: string[];
}

export default function BusinessLayoutScreen() {
    const { user } = useAuth();
    const { businessId, isApproved } = useUserRole();
    const [selectedTool, setSelectedTool] = useState<keyof typeof FURNITURE_TYPES | null>(null);
    const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
    const [layoutName, setLayoutName] = useState('Основная терраса');
    const [terraceSize, setTerraceSize] = useState({ width: 300, height: 300 });
    const [loading, setLoading] = useState(false);
    const [savedLayouts, setSavedLayouts] = useState<LayoutData[]>([]);

    useEffect(() => {
        loadSavedLayouts();
    }, []);

    const loadSavedLayouts = async () => {
        if (!businessId) return;

        try {
            const docRef = doc(db, 'businessProfiles', businessId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setSavedLayouts(data.terraceLayouts || []);

                // Загружаем первую планировку если есть
                if (data.terraceLayouts && data.terraceLayouts.length > 0) {
                    const firstLayout = data.terraceLayouts[0];
                    setFurniture(firstLayout.furniture || []);
                    setLayoutName(firstLayout.name || 'Основная терраса');
                    setTerraceSize({
                        width: firstLayout.width || 300,
                        height: firstLayout.height || 300
                    });
                }
            }
        } catch (error) {
            console.error('Error loading layouts:', error);
        }
    };

    const saveLayout = async () => {
        if (!businessId) {
            Alert.alert('Ошибка', 'Бизнес ID не найден');
            return;
        }

        setLoading(true);
        try {
            const layoutData: LayoutData = {
                name: layoutName,
                width: terraceSize.width,
                height: terraceSize.height,
                furniture: furniture,
                features: [
                    `📐 Планировка: ${layoutName}`,
                    `🪑 Мест: ${furniture.filter(f => f.type === 'chair').length}`,
                    `🍽️ Столов: ${furniture.filter(f => f.type.includes('table')).length}`,
                    `📏 Размер: ${Math.round(terraceSize.width / 20)}x${Math.round(terraceSize.height / 20)}м`
                ]
            };

            // Обновляем или добавляем планировку
            const updatedLayouts = savedLayouts.length > 0
                ? [layoutData, ...savedLayouts.slice(1)]
                : [layoutData];

            const docRef = doc(db, 'businessProfiles', businessId);
            await updateDoc(docRef, {
                terraceLayouts: updatedLayouts,
                hasCustomLayout: true
            });

            setSavedLayouts(updatedLayouts);
            Alert.alert('Успешно!', 'Планировка террасы сохранена');
        } catch (error) {
            console.error('Error saving layout:', error);
            Alert.alert('Ошибка', 'Не удалось сохранить планировку');
        } finally {
            setLoading(false);
        }
    };

    const addFurniture = (x: number, y: number) => {
        if (!selectedTool) return;

        const furnitureType = FURNITURE_TYPES[selectedTool];
        const itemWidth = furnitureType.width || furnitureType.size;
        const itemHeight = furnitureType.size;

        // Проверяем границы с учетом поворота
        if (x + itemWidth > terraceSize.width || y + itemHeight > terraceSize.height) {
            Alert.alert('Внимание', 'Мебель не помещается в выбранном месте');
            return;
        }

        const newItem: FurnitureItem = {
            id: Date.now().toString(),
            type: selectedTool,
            x: Math.round(x / GRID_SIZE) * GRID_SIZE,
            y: Math.round(y / GRID_SIZE) * GRID_SIZE,
            rotation: 0,
            width: furnitureType.width,
            selected: false,
            locked: false
        };

        setFurniture([...furniture, newItem]);
    };

    const rotateFurniture = (item: FurnitureItem) => {
        if (!FURNITURE_TYPES[item.type].rotatable) return;

        const newRotation = (item.rotation + 90) % 360;
        const updatedFurniture = furniture.map(f =>
            f.id === item.id ? { ...f, rotation: newRotation } : f
        );
        setFurniture(updatedFurniture);
    };

    const toggleSelection = (item: FurnitureItem) => {
        const updatedFurniture = furniture.map(f =>
            f.id === item.id ? { ...f, selected: !f.selected } : f
        );
        setFurniture(updatedFurniture);
    };

    const toggleLock = (item: FurnitureItem) => {
        const updatedFurniture = furniture.map(f =>
            f.id === item.id ? { ...f, locked: !f.locked } : f
        );
        setFurniture(updatedFurniture);
    };

    const groupSelected = () => {
        const groupId = Date.now().toString();
        const updatedFurniture = furniture.map(f =>
            f.selected ? { ...f, group: groupId, selected: false } : f
        );
        setFurniture(updatedFurniture);
    };

    const ungroupSelected = () => {
        const updatedFurniture = furniture.map(f =>
            f.selected ? { ...f, group: undefined, selected: false } : f
        );
        setFurniture(updatedFurniture);
    };

    const removeFurniture = (id: string) => {
        setFurniture(furniture.filter(item => item.id !== id));
    };

    const clearAll = () => {
        Alert.alert(
            'Очистить все?',
            'Вы уверены, что хотите удалить все элементы?',
            [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Очистить', style: 'destructive', onPress: () => setFurniture([]) }
            ]
        );
    };

    const renderGrid = () => {
        const gridLines = [];

        // Вертикальные линии
        for (let i = 0; i <= terraceSize.width; i += GRID_SIZE) {
            gridLines.push(
                <View
                    key={`v-${i}`}
                    style={[
                        styles.gridLine,
                        {
                            left: i,
                            top: 0,
                            width: 1,
                            height: terraceSize.height,
                        }
                    ]}
                />
            );
        }

        // Горизонтальные линии
        for (let i = 0; i <= terraceSize.height; i += GRID_SIZE) {
            gridLines.push(
                <View
                    key={`h-${i}`}
                    style={[
                        styles.gridLine,
                        {
                            left: 0,
                            top: i,
                            width: terraceSize.width,
                            height: 1,
                        }
                    ]}
                />
            );
        }

        return gridLines;
    };

    const renderFurniture = () => {
        return furniture.map((item) => {
            const furnitureType = FURNITURE_TYPES[item.type];
            const itemWidth = item.width || furnitureType.size;
            const itemHeight = furnitureType.size;

            return (
                <TouchableOpacity
                    key={item.id}
                    style={[
                        styles.furnitureItem,
                        {
                            left: item.x,
                            top: item.y,
                            width: itemWidth,
                            height: itemHeight,
                            backgroundColor: furnitureType.color + (item.selected ? '80' : '40'),
                            borderColor: item.selected ? '#8B1538' : furnitureType.color,
                            borderWidth: item.selected ? 2 : 1,
                            transform: [{ rotate: `${item.rotation}deg` }],
                            opacity: item.locked ? 0.7 : 1,
                        }
                    ]}
                    onPress={() => toggleSelection(item)}
                    onLongPress={() => {
                        Alert.alert(
                            furnitureType.name,
                            'Выберите действие',
                            [
                                { text: 'Отмена', style: 'cancel' },
                                {
                                    text: item.locked ? 'Разблокировать' : 'Заблокировать',
                                    onPress: () => toggleLock(item)
                                },
                                furnitureType.rotatable ?
                                    { text: 'Повернуть', onPress: () => rotateFurniture(item) } : null,
                                {
                                    text: 'Удалить', style: 'destructive',
                                    onPress: () => removeFurniture(item.id)
                                }
                            ].filter(Boolean)
                        );
                    }}
                >
                    <View style={[
                        styles.furnitureContent,
                        { transform: [{ rotate: `${-item.rotation}deg` }] }
                    ]}>
                        <Text style={styles.furnitureEmoji}>{furnitureType.emoji}</Text>
                        {furnitureType.capacity && (
                            <Text style={styles.capacityBadge}>
                                {furnitureType.capacity}
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            );
        });
    };

    if (!isApproved) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>← Назад</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Планировка террасы</Text>
                </View>

                <View style={styles.notApprovedContainer}>
                    <Text style={styles.notApprovedTitle}>Доступ ограничен</Text>
                    <Text style={styles.notApprovedText}>
                        Планировка террасы доступна только для одобренных заведений
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>← Назад</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Планировка террасы</Text>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>📐 Как создать планировку:</Text>
                <Text style={styles.instructionsText}>
                    1. Выберите тип мебели из панели инструментов{'\n'}
                    2. Нажмите на террасе, чтобы разместить элемент{'\n'}
                    3. Нажмите на элемент, чтобы удалить его{'\n'}
                    4. Сохраните планировку для отображения гостям
                </Text>
            </View>

            {/* Toolbar */}
            <View style={styles.toolbar}>
                <Text style={styles.toolbarTitle}>Инструменты:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.toolsContainer}>
                        {Object.entries(FURNITURE_TYPES).map(([key, type]) => (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.toolButton,
                                    selectedTool === key && styles.selectedToolButton
                                ]}
                                onPress={() => setSelectedTool(selectedTool === key ? null : key as keyof typeof FURNITURE_TYPES)}
                            >
                                <Text style={styles.toolEmoji}>{type.emoji}</Text>
                                <Text style={[
                                    styles.toolName,
                                    selectedTool === key && styles.selectedToolName
                                ]}>
                                    {type.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Canvas */}
            <View style={styles.canvasContainer}>
                <Text style={styles.canvasTitle}>🏖️ {layoutName}</Text>

                <TouchableOpacity
                    style={[styles.canvas, { width: terraceSize.width, height: terraceSize.height }]}
                    onPress={(event) => {
                        const { locationX, locationY } = event.nativeEvent;
                        addFurniture(locationX, locationY);
                    }}
                    activeOpacity={0.8}
                >
                    {renderGrid()}
                    {renderFurniture()}

                    {/* Canvas border */}
                    <View style={styles.canvasBorder} />
                </TouchableOpacity>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statEmoji}>🪑</Text>
                        <Text style={styles.statText}>
                            {furniture.filter(f => f.type === 'chair').length} стульев
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statEmoji}>🍽️</Text>
                        <Text style={styles.statText}>
                            {furniture.filter(f => f.type.includes('table')).length} столов
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statEmoji}>📏</Text>
                        <Text style={styles.statText}>
                            {Math.round(terraceSize.width / 20)}×{Math.round(terraceSize.height / 20)}м
                        </Text>
                    </View>
                </View>
            </View>

            {/* Group Actions */}
            {furniture.some(item => item.selected) && (
                <View style={styles.groupActionsContainer}>
                    <TouchableOpacity
                        style={styles.groupActionButton}
                        onPress={() => {
                            const selectedItems = furniture.filter(f => f.selected);
                            if (selectedItems.length > 1) {
                                groupSelected();
                            }
                        }}
                    >
                        <Text style={styles.groupActionText}>🔗 Группировать</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.groupActionButton}
                        onPress={() => {
                            const selectedItems = furniture.filter(f => f.selected);
                            selectedItems.forEach(item => {
                                if (FURNITURE_TYPES[item.type].rotatable) {
                                    rotateFurniture(item);
                                }
                            });
                        }}
                    >
                        <Text style={styles.groupActionText}>🔄 Повернуть</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.groupActionButton}
                        onPress={() => {
                            const selectedItems = furniture.filter(f => f.selected);
                            selectedItems.forEach(item => toggleLock(item));
                        }}
                    >
                        <Text style={styles.groupActionText}>🔒 Блокировать</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.groupActionButton, styles.deleteButton]}
                        onPress={() => {
                            const selectedItems = furniture.filter(f => f.selected);
                            Alert.alert(
                                'Удаление элементов',
                                `Удалить выбранные элементы (${selectedItems.length})?`,
                                [
                                    { text: 'Отмена', style: 'cancel' },
                                    {
                                        text: 'Удалить',
                                        style: 'destructive',
                                        onPress: () => {
                                            setFurniture(furniture.filter(f => !f.selected));
                                        }
                                    }
                                ]
                            );
                        }}
                    >
                        <Text style={styles.deleteButtonText}>🗑️ Удалить</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearAll}
                >
                    <Text style={styles.clearButtonText}>🗑️ Очистить все</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabledButton]}
                    onPress={saveLayout}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? '⏳ Сохранение...' : '💾 Сохранить планировку'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Templates */}
            <View style={styles.templatesContainer}>
                <Text style={styles.templatesTitle}>🎨 Быстрые шаблоны:</Text>
                <View style={styles.templatesGrid}>
                    <TouchableOpacity
                        style={styles.templateButton}
                        onPress={() => {
                            setFurniture([
                                { id: '1', type: 'table_round', x: 60, y: 60 },
                                { id: '2', type: 'chair', x: 40, y: 40 },
                                { id: '3', type: 'chair', x: 80, y: 40 },
                                { id: '4', type: 'chair', x: 40, y: 80 },
                                { id: '5', type: 'chair', x: 80, y: 80 },
                                { id: '6', type: 'plant', x: 20, y: 20 },
                            ]);
                        }}
                    >
                        <Text style={styles.templateEmoji}>☕</Text>
                        <Text style={styles.templateName}>Кафе</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.templateButton}
                        onPress={() => {
                            setFurniture([
                                { id: '1', type: 'bar', x: 40, y: 40 },
                                { id: '2', type: 'chair', x: 20, y: 60 },
                                { id: '3', type: 'chair', x: 40, y: 60 },
                                { id: '4', type: 'chair', x: 60, y: 60 },
                                { id: '5', type: 'sofa', x: 160, y: 80 },
                                { id: '6', type: 'heater', x: 200, y: 20 },
                            ]);
                        }}
                    >
                        <Text style={styles.templateEmoji}>🍺</Text>
                        <Text style={styles.templateName}>Бар</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.templateButton}
                        onPress={() => {
                            setFurniture([
                                { id: '1', type: 'table_square', x: 60, y: 60 },
                                { id: '2', type: 'table_square', x: 160, y: 60 },
                                { id: '3', type: 'chair', x: 40, y: 40 },
                                { id: '4', type: 'chair', x: 80, y: 40 },
                                { id: '5', type: 'chair', x: 140, y: 40 },
                                { id: '6', type: 'chair', x: 180, y: 40 },
                                { id: '7', type: 'plant', x: 220, y: 20 },
                                { id: '8', type: 'plant', x: 20, y: 120 },
                            ]);
                        }}
                    >
                        <Text style={styles.templateEmoji}>🍽️</Text>
                        <Text style={styles.templateName}>Ресторан</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
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
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    backButton: {
        marginRight: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: '#8B1538',
        fontWeight: '600',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1D1F',
    },

    // Instructions
    instructionsCard: {
        margin: 24,
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#8B1538',
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 12,
    },
    instructionsText: {
        fontSize: 14,
        color: '#48484A',
        lineHeight: 22,
    },

    // Toolbar
    toolbar: {
        marginHorizontal: 24,
        marginBottom: 24,
    },
    toolbarTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 12,
    },
    toolsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    toolButton: {
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E5EA',
        minWidth: 80,
    },
    selectedToolButton: {
        borderColor: '#8B1538',
        backgroundColor: '#8B1538' + '10',
    },
    toolEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    toolName: {
        fontSize: 12,
        color: '#48484A',
        textAlign: 'center',
        fontWeight: '500',
    },
    selectedToolName: {
        color: '#8B1538',
        fontWeight: '600',
    },

    // Canvas
    canvasContainer: {
        alignItems: 'center',
        marginHorizontal: 24,
        marginBottom: 24,
    },
    canvasTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 16,
    },
    canvas: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    canvasBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderWidth: 2,
        borderColor: '#8B1538',
        borderRadius: 12,
        pointerEvents: 'none',
    },
    gridLine: {
        position: 'absolute',
        backgroundColor: '#E5E5EA',
        opacity: 0.3,
    },

    // Furniture
    furnitureItem: {
        position: 'absolute',
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    furnitureContent: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    furnitureEmoji: {
        fontSize: 20,
    },
    capacityBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#8B1538',
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        width: 20,
        height: 20,
        borderRadius: 10,
        textAlign: 'center',
        lineHeight: 20,
        overflow: 'hidden',
    },
    rotateButton: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        backgroundColor: '#FFFFFF',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    rotateIcon: {
        fontSize: 16,
    },

    // Stats
    statsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 16,
    },
    statItem: {
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        minWidth: 80,
    },
    statEmoji: {
        fontSize: 20,
        marginBottom: 4,
    },
    statText: {
        fontSize: 12,
        color: '#48484A',
        fontWeight: '500',
        textAlign: 'center',
    },

    // Group Actions
    groupActionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginHorizontal: 24,
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
    },
    groupActionButton: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    groupActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1D1F',
    },

    // Actions
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 24,
        marginBottom: 24,
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#FF3B30',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 2,
        backgroundColor: '#8B1538',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.6,
    },

    // Templates
    templatesContainer: {
        marginHorizontal: 24,
        marginBottom: 32,
    },
    templatesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 12,
    },
    templatesGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    templateButton: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    templateEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    templateName: {
        fontSize: 14,
        color: '#48484A',
        fontWeight: '500',
    },

    // Not approved
    notApprovedContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    notApprovedTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FF3B30',
        marginBottom: 16,
        textAlign: 'center',
    },
    notApprovedText: {
        fontSize: 16,
        color: '#48484A',
        textAlign: 'center',
        lineHeight: 24,
    },
}); 