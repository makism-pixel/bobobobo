import React from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const VIEWER_WIDTH = screenWidth - 48;
const SCALE_FACTOR = 0.6; // Уменьшенный масштаб для просмотра

// Типы мебели (копия из редактора)
const FURNITURE_TYPES = {
    table_round: { emoji: '⭕', name: 'Круглый стол', size: 40, color: '#8B4513' },
    table_square: { emoji: '⬜', name: 'Квадратный стол', size: 40, color: '#8B4513' },
    chair: { emoji: '💺', name: 'Стул', size: 20, color: '#654321' },
    sofa: { emoji: '🛋️', name: 'Диван', size: 60, color: '#4169E1' },
    bar: { emoji: '🍺', name: 'Барная стойка', size: 80, color: '#2F4F4F' },
    plant: { emoji: '🪴', name: 'Растение', size: 30, color: '#228B22' },
    heater: { emoji: '🔥', name: 'Обогреватель', size: 35, color: '#FF4500' },
};

interface FurnitureItem {
    id: string;
    type: keyof typeof FURNITURE_TYPES;
    x: number;
    y: number;
    rotation?: number;
}

interface LayoutData {
    name: string;
    width: number;
    height: number;
    furniture: FurnitureItem[];
    features: string[];
}

interface LayoutViewerProps {
    layouts: LayoutData[];
    showTitle?: boolean;
}

export default function LayoutViewer({ layouts, showTitle = true }: LayoutViewerProps) {
    if (!layouts || layouts.length === 0) {
        return null;
    }

    const layout = layouts[0]; // Показываем первую планировку
    const scaledWidth = layout.width * SCALE_FACTOR;
    const scaledHeight = layout.height * SCALE_FACTOR;

    const renderFurniture = () => {
        return layout.furniture.map((item) => {
            const furnitureType = FURNITURE_TYPES[item.type];
            if (!furnitureType) return null;

            return (
                <View
                    key={item.id}
                    style={[
                        styles.furnitureItem,
                        {
                            left: item.x * SCALE_FACTOR,
                            top: item.y * SCALE_FACTOR,
                            width: furnitureType.size * SCALE_FACTOR,
                            height: furnitureType.size * SCALE_FACTOR,
                            backgroundColor: furnitureType.color + '40',
                            borderColor: furnitureType.color,
                        }
                    ]}
                >
                    <Text style={[
                        styles.furnitureEmoji,
                        { fontSize: 12 * SCALE_FACTOR }
                    ]}>
                        {furnitureType.emoji}
                    </Text>
                </View>
            );
        });
    };

    const stats = {
        chairs: layout.furniture.filter(f => f.type === 'chair').length,
        tables: layout.furniture.filter(f => f.type.includes('table')).length,
        size: `${Math.round(layout.width / 20)}×${Math.round(layout.height / 20)}м`
    };

    return (
        <View style={styles.container}>
            {showTitle && (
                <Text style={styles.sectionTitle}>📐 Планировка террасы</Text>
            )}

            <View style={styles.layoutCard}>
                <Text style={styles.layoutName}>🏖️ {layout.name}</Text>

                <View style={styles.canvasContainer}>
                    <View
                        style={[
                            styles.canvas,
                            {
                                width: scaledWidth,
                                height: scaledHeight,
                            }
                        ]}
                    >
                        {renderFurniture()}
                        <View style={styles.canvasBorder} />
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statEmoji}>🪑</Text>
                        <Text style={styles.statText}>{stats.chairs} мест</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statEmoji}>🍽️</Text>
                        <Text style={styles.statText}>{stats.tables} столов</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statEmoji}>📏</Text>
                        <Text style={styles.statText}>{stats.size}</Text>
                    </View>
                </View>

                <Text style={styles.helpText}>
                    💡 Интерактивная планировка поможет выбрать лучшее место
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 12,
        paddingHorizontal: 24,
    },

    layoutCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },

    layoutName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 16,
        textAlign: 'center',
    },

    canvasContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },

    canvas: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
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

    furnitureItem: {
        position: 'absolute',
        borderRadius: 4,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    furnitureEmoji: {
        fontSize: 12,
    },

    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },

    statItem: {
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        minWidth: 70,
    },

    statEmoji: {
        fontSize: 16,
        marginBottom: 4,
    },

    statText: {
        fontSize: 12,
        color: '#48484A',
        fontWeight: '500',
        textAlign: 'center',
    },

    helpText: {
        fontSize: 12,
        color: '#8E8E93',
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 16,
    },
}); 