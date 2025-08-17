import { supabase } from '@/config/supabase';

// Функция для проверки подключения к Supabase
export const testSupabaseConnection = async () => {
    try {
        console.log('🔍 Testing Supabase connection...');

        // Сначала пробуем простой запрос к таблице
        const { data, error, count } = await supabase
            .from('photos')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Supabase table error:', error);

            // Если таблица не существует, пробуем проверить подключение через auth
            try {
                const { data: { session }, error: authError } = await supabase.auth.getSession();
                if (authError) {
                    console.error('❌ Supabase auth error:', authError);
                    return false;
                }

                console.log('✅ Supabase connection successful (but photos table may not exist)');
                console.log('📋 Need to create photos table - see supabase_setup.sql');
                return true;
            } catch (authError) {
                console.error('❌ Supabase connection completely failed:', authError);
                return false;
            }
        }

        console.log('✅ Supabase connection successful');
        console.log(`📊 Photos table has ${count || 0} records`);
        return true;
    } catch (error) {
        console.error('❌ Supabase connection failed:', error);
        return false;
    }
};

// Функция для проверки структуры таблицы photos
export const checkPhotosTableStructure = async () => {
    try {
        console.log('🔍 Checking photos table structure...');

        const { data, error } = await supabase
            .from('photos')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Error checking table structure:', error);
            return null;
        }

        if (data && data.length > 0) {
            console.log('📋 Photos table structure (first row):', data[0]);
            console.log('📋 Available fields:', Object.keys(data[0]));
        } else {
            console.log('📋 Photos table is empty, checking with insert test...');

            // Попробуем получить информацию о структуре через метаданные
            const { data: metaData, error: metaError } = await supabase
                .from('photos')
                .select()
                .limit(0);

            console.log('📋 Table metadata:', { metaData, metaError });
        }

        return data;
    } catch (error) {
        console.error('❌ Error checking photos table:', error);
        return null;
    }
};

// Функция для получения всех фотографий для отладки
export const debugGetAllPhotos = async () => {
    try {
        console.log('🔍 Getting all photos for debug...');

        const { data, error } = await supabase
            .from('photos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error getting all photos:', error);
            return [];
        }

        console.log(`📸 Found ${data?.length || 0} photos in database`);

        if (data && data.length > 0) {
            console.log('📋 Sample photos:', data.slice(0, 3));

            // Группируем по бизнесам
            const businessGroups = data.reduce((acc: any, photo: any) => {
                const businessId = photo.firebase_business_id || photo.business_id;
                if (!acc[businessId]) {
                    acc[businessId] = [];
                }
                acc[businessId].push(photo);
                return acc;
            }, {});

            console.log('📊 Photos by business:', Object.keys(businessGroups).map(id => ({
                businessId: id,
                count: businessGroups[id].length,
                hasMain: businessGroups[id].some((p: any) => p.is_main)
            })));
        }

        return data || [];
    } catch (error) {
        console.error('❌ Error in debugGetAllPhotos:', error);
        return [];
    }
};

// Функция для проверки конкретного бизнеса
export const debugBusinessPhotos = async (businessId: string) => {
    try {
        console.log(`🔍 Checking photos for business: ${businessId}`);

        // Проверяем оба варианта поля
        const { data: dataFirebase, error: errorFirebase } = await supabase
            .from('photos')
            .select('*')
            .eq('firebase_business_id', businessId);

        const { data: dataBusiness, error: errorBusiness } = await supabase
            .from('photos')
            .select('*')
            .eq('business_id', businessId);

        console.log('📋 Results with firebase_business_id:', {
            count: dataFirebase?.length || 0,
            error: errorFirebase,
            data: dataFirebase?.slice(0, 2)
        });

        console.log('📋 Results with business_id:', {
            count: dataBusiness?.length || 0,
            error: errorBusiness,
            data: dataBusiness?.slice(0, 2)
        });

        return {
            firebaseField: dataFirebase || [],
            businessField: dataBusiness || []
        };
    } catch (error) {
        console.error('❌ Error in debugBusinessPhotos:', error);
        return { firebaseField: [], businessField: [] };
    }
};

// Главная функция отладки
export const runSupabaseDebug = async (businessId?: string) => {
    console.log('🚀 Starting Supabase debug session...');

    await testSupabaseConnection();
    await checkPhotosTableStructure();
    await debugGetAllPhotos();

    if (businessId) {
        await debugBusinessPhotos(businessId);
    }

    console.log('✅ Supabase debug session completed');
};

// Функция для отладки конкретного бизнеса из логов
export const debugSpecificBusiness = async (businessId: string) => {
    console.log(`🔍 === DEBUGGING SPECIFIC BUSINESS: ${businessId} ===`);

    // Проверяем все возможные варианты ID
    const businessIds = [
        businessId,
        businessId.split('_')[0], // Базовый ID без timestamp
        businessId.replace(/_\d+$/, '') // Удаляем timestamp в конце
    ];

    for (const id of businessIds) {
        console.log(`🔍 Checking business ID variant: ${id}`);
        await debugBusinessPhotos(id);
    }

    console.log(`✅ === DEBUGGING COMPLETED FOR: ${businessId} ===`);
};
