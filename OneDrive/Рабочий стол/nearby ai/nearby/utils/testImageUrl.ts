// Утилита для тестирования доступности изображений

export const testImageUrl = async (url: string): Promise<boolean> => {
    try {
        console.log('🧪 Testing image URL:', url);

        const response = await fetch(url, {
            method: 'HEAD', // Только заголовки, без загрузки содержимого
            timeout: 5000
        });

        console.log('📋 Response status:', response.status);
        console.log('📋 Response headers:', {
            'content-type': response.headers.get('content-type'),
            'content-length': response.headers.get('content-length'),
            'cache-control': response.headers.get('cache-control')
        });

        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
            console.log('✅ Image URL is accessible');
            return true;
        } else {
            console.log('❌ Image URL is not accessible or not an image');
            return false;
        }
    } catch (error) {
        console.error('❌ Error testing image URL:', error);
        return false;
    }
};

export const testAllImageUrls = async (urls: string[]) => {
    console.log('🧪 Testing multiple image URLs...');

    for (const url of urls) {
        await testImageUrl(url);
    }

    console.log('✅ Image URL testing completed');
};
