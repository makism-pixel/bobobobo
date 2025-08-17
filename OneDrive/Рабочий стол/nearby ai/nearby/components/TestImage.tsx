import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface TestImageProps {
    uri: string;
    name: string;
}

export default function TestImage({ uri, name }: TestImageProps) {
    console.log('🧪 TestImage rendering for:', name, 'URI:', uri);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Test Image: {name}</Text>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                    onLoad={() => console.log('✅ TestImage loaded:', name, uri)}
                    onError={(error) => console.error('❌ TestImage error:', name, error, uri)}
                    placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        marginVertical: 5,
        borderRadius: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#ddd',
        borderWidth: 2,
        borderColor: '#00FF00', // Зеленая рамка для отладки
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
