import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Alert,
    Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const MINI_CANVAS_WIDTH = screenWidth - 48;
const MINI_CANVAS_HEIGHT = 200;
const MINI_GRID_SIZE = 15;

// Упрощенные типы мебели для быстрого создания
const QUICK_FURNITURE = {
    table_round: { emoji: '⭕', name: 'Стол', size: 30, color: '#8B4513' },
    chair: { emoji: '💺', name: 'Стул', size: 15, color: '#654321' },
    plant: { emoji: '🪴', name: 'Растение', size: 20, color: '#228B22' },
};

interface FurnitureItem {
    id: string;
    type: keyof typeof QUICK_FURNITURE;
    x: number;
    y: number;
}

interface LayoutData {
    name: string;
    width: number;
    height: number;
    furniture: FurnitureItem[];
    features: string[];
}

interface TerraceLayoutEditorProps {
    onLayoutChange: (layout: LayoutData | null) => void;
    initialLayout?: LayoutData | null;
}

export default function TerraceLayoutEditor({ onLayoutChange, initialLayout }: TerraceLayoutEditorProps) {
    const [selectedTool, setSelectedTool] = useState<keyof typeof QUICK_FURNITURE | null>(null);
    const [furniture, setFurniture] = useState<FurnitureItem[]>(initialLayout?.furniture || []);
    const [showEditor, setShowEditor] = useState(!!initialLayout);
    const [layoutName] = useState('Основная терраса');
    const [terraceSize] = useState({ width: MINI_CANVAS_WIDTH - 40, height: MINI_CANVAS_HEIGHT });

    const addFurniture = (x: number, y: number) => {
        if (!selectedTool) return;

        const furnitureSize = QUICK_FURNITURE[selectedTool].size;
        if (x + furnitureSize > terraceSize.width || y + furnitureSize > terraceSize.height) {
            return;
        }

        const newItem: FurnitureItem = {
            id: Date.now().toString(),
            type: selectedTool,
            x: Math.round(x / MINI_GRID_SIZE) * MINI_GRID_SIZE,
            y: Math.round(y / MINI_GRID_SIZE) * MINI_GRID_SIZE,
        };

        const newFurniture = [...furniture, newItem];
        setFurniture(newFurniture);
        updateLayout(newFurniture);
    };

    const removeFurniture = (id: string) => {
        const newFurniture = furniture.filter(item => item.id !== id);
        setFurniture(newFurniture);
        updateLayout(newFurniture);
    };

    const updateLayout = (furnitureItems: FurnitureItem[]) => {
        if (furnitureItems.length === 0) {
            onLayoutChange(null);
            return;
        }

        const layoutData: LayoutData = {
            name: layoutName,
            width: terraceSize.width,
            height: terraceSize.height,
            furniture: furnitureItems,
            features: [
                `📐 Интерактивная планировка террасы`,
                `🪑 ${furnitureItems.filter(f => f.type === 'chair').length} мест для гостей`,
                `🍽️ ${furnitureItems.filter(f => f.type === 'table_round').length} столов`,
            ]
        };

        onLayoutChange(layoutData);
    };

    const clearAll = () => {
        setFurniture([]);
        onLayoutChange(null);
    };

    const useTemplate = (templateName: string) => {
        let templateFurniture: FurnitureItem[] = [];

        switch (templateName) {
            case 'cafe':
                templateFurniture = [
                    { id: '1', type: 'table_round', x: 60, y: 40 },
                    { id: '2', type: 'chair', x: 45, y: 25 },
                    { id: '3', type: 'chair', x: 75, y: 25 },
                    { id: '4', type: 'chair', x: 45, y: 70 },
                    { id: '5', type: 'chair', x: 75, y: 70 },
                    { id: '6', type: 'plant', x: 20, y: 20 },
                    { id: '7', type: 'table_round', x: 150, y: 40 },
                    { id: '8', type: 'chair', x: 135, y: 25 },
                    { id: '9', type: 'chair', x: 165, y: 25 },
                ];
                break;
            case 'restaurant':
                templateFurniture = [
                    { id: '1', type: 'table_round', x: 50, y: 30 },
                    { id: '2', type: 'table_round', x: 130, y: 30 },
                    { id: '3', type: 'table_round', x: 210, y: 30 },
                    { id: '4', type: 'chair', x: 35, y: 15 },
                    { id: '5', type: 'chair', x: 65, y: 15 },
                    { id: '6', type: 'chair', x: 115, y: 15 },
                    { id: '7', type: 'chair', x: 145, y: 15 },
                    { id: '8', type: 'plant', x: 15, y: 80 },
                    { id: '9', type: 'plant', x: 250, y: 80 },
                ];
                break;
            case 'cozy':
                templateFurniture = [
                    { id: '1', type: 'table_round', x: 90, y: 50 },
                    { id: '2', type: 'chair', x: 75, y: 35 },
                    { id: '3', type: 'chair', x: 105, y: 35 },
                    { id: '4', type: 'chair', x: 75, y: 80 },
                    { id: '5', type: 'chair', x: 105, y: 80 },
                    { id: '6', type: 'plant', x: 30, y: 30 },
                    { id: '7', type: 'plant', x: 180, y: 30 },
                    { id: '8', type: 'plant', x: 30, y: 120 },
                    { id: '9', type: 'plant', x: 180, y: 120 },
                ];
                break;
        }

        setFurniture(templateFurniture);
        updateLayout(templateFurniture);
    };

    const renderFurniture = () => {
        return furniture.map((item) => {
            const furnitureType = QUICK_FURNITURE[item.type];

            return (
                <TouchableOpacity
                    key={item.id}
                    style={[
                        styles.furnitureItem,
                        {
                            left: item.x,
                            top: item.y,
                            width: furnitureType.size,
                            height: furnitureType.size,
                            backgroundColor: furnitureType.color + '40',
                            borderColor: furnitureType.color,
                        }
                    ]}
                    onPress={() => removeFurniture(item.id)}
                >
                    <Text style={styles.furnitureEmoji}>{furnitureType.emoji}</Text>
                </TouchableOpacity>
            );
        });
    };

    if (!showEditor) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>🏖️ Планировка террасы</Text>
                    <Text style={styles.headerSubtitle}>
                        Создайте интерактивную схему вашей террасы для гостей
                    </Text>
                </View>

                <View style={styles.benefitsCard}>
                    <Text style={styles.benefitsTitle}>💡 Преимущества планировки:</Text>
                    <Text style={styles.benefitItem}>• Гости смогут выбрать лучшее место</Text>
                    <Text style={styles.benefitItem}>• Покажите уютную атмосферу</Text>
                    <Text style={styles.benefitItem}>• Выделитесь среди конкурентов</Text>
                    <Text style={styles.benefitItem}>• Увеличьте количество бронирований</Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => setShowEditor(true)}
                    >
                        <Text style={styles.createButtonText}>📐 Создать планировку</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => onLayoutChange(null)}
                    >
                        <Text style={styles.skipButtonText}>Пропустить (можно добавить позже)</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🏖️ Создание планировки</Text>
                <Text style={styles.headerSubtitle}>
                    Нажмите на инструмент, затем на террасу для размещения
                </Text>
            </View>

            {/* Быстрые шаблоны */}
            <View style={styles.templatesSection}>
                <Text style={styles.templatesTitle}>🎨 Быстрые шаблоны:</Text>
                <View style={styles.templatesRow}>
                    <TouchableOpacity
                        style={styles.templateButton}
                        onPress={() => useTemplate('cafe')}
                    >
                        <Text style={styles.templateEmoji}>☕</Text>
                        <Text style={styles.templateName}>Кафе</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.templateButton}
                        onPress={() => useTemplate('restaurant')}
                    >
                        <Text style={styles.templateEmoji}>🍽️</Text>
                        <Text style={styles.templateName}>Ресторан</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.templateButton}
                        onPress={() => useTemplate('cozy')}
                    >
                        <Text style={styles.templateEmoji}>🏡</Text>
                        <Text style={styles.templateName}>Уютное</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Инструменты */}
            <View style={styles.toolbar}>
                <Text style={styles.toolbarTitle}>Инструменты:</Text>
                <View style={styles.toolsContainer}>
                    {Object.entries(QUICK_FURNITURE).map(([key, type]) => (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.toolButton,
                                selectedTool === key && styles.selectedToolButton
                            ]}
                            onPress={() => setSelectedTool(selectedTool === key ? null : key as keyof typeof QUICK_FURNITURE)}
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
            </View>

            {/* Мини-холст */}
            <View style={styles.canvasContainer}>
                <TouchableOpacity
                    style={[styles.canvas, { width: terraceSize.width, height: terraceSize.height }]}
                    onPress={(event) => {
                        const { locationX, locationY } = event.nativeEvent;
                        addFurniture(locationX, locationY);
                    }}
                    activeOpacity={0.8}
                >
                    {renderFurniture()}
                    <View style={styles.canvasBorder} />
                </TouchableOpacity>

                {/* Статистика */}
                <View style={styles.statsContainer}>
                    <Text style={styles.statText}>
                        🪑 {furniture.filter(f => f.type === 'chair').length} мест
                    </Text>
                    <Text style={styles.statText}>
                        🍽️ {furniture.filter(f => f.type === 'table_round').length} столов
                    </Text>
                </View>
            </View>

            {/* Действия */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearAll}
                >
                    <Text style={styles.clearButtonText}>🗑️ Очистить</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setShowEditor(false)}
                >
                    <Text style={styles.doneButtonText}>✅ Готово</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },

    // Header
    header: {
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#48484A',
        lineHeight: 20,
    },

    // Benefits
    benefitsCard: {
        backgroundColor: '#F0F9FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#0EA5E9',
    },
    benefitsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0C4A6E',
        marginBottom: 8,
    },
    benefitItem: {
        fontSize: 14,
        color: '#0C4A6E',
        marginBottom: 4,
        lineHeight: 20,
    },

    // Action Buttons
    actionButtons: {
        gap: 12,
    },
    createButton: {
        backgroundColor: '#8B1538',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    skipButtonText: {
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: '500',
    },

    // Templates
    templatesSection: {
        marginBottom: 16,
    },
    templatesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    templatesRow: {
        flexDirection: 'row',
        gap: 8,
    },
    templateButton: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
    },
    templateEmoji: {
        fontSize: 20,
        marginBottom: 4,
    },
    templateName: {
        fontSize: 12,
        color: '#48484A',
        fontWeight: '500',
    },

    // Toolbar
    toolbar: {
        marginBottom: 16,
    },
    toolbarTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    toolsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    toolButton: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    selectedToolButton: {
        borderColor: '#8B1538',
        backgroundColor: '#8B1538' + '10',
    },
    toolEmoji: {
        fontSize: 20,
        marginBottom: 4,
    },
    toolName: {
        fontSize: 11,
        color: '#48484A',
        fontWeight: '500',
    },
    selectedToolName: {
        color: '#8B1538',
        fontWeight: '600',
    },

    // Canvas
    canvasContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    canvas: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
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
        borderRadius: 8,
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

    // Stats
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    statText: {
        fontSize: 12,
        color: '#48484A',
        fontWeight: '500',
    },

    // Actions
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    doneButton: {
        flex: 2,
        backgroundColor: '#34C759',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
}); 