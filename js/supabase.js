import { SUPABASE_URL, SUPABASE_ANON_KEY, BRAND_ID } from './config.js';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Query helpers with brand filtering
const db = {
    // Generic fetch with brand filter
    async fetch(table, options = {}) {
        let query = supabase.from(table).select(options.select || '*');
        
        if (options.brandFilter !== false) {
            query = query.eq('brand_id', BRAND_ID);
        }
        
        if (options.order) {
            query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
        }
        
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        if (options.filters) {
            options.filters.forEach(f => {
                query = query[f.op || 'eq'](f.column, f.value);
            });
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    // Insert with auto brand_id
    async insert(table, record) {
        const { data, error } = await supabase
            .from(table)
            .insert({ ...record, brand_id: BRAND_ID })
            .select();
        if (error) throw error;
        return data[0];
    },

    // Update by id
    async update(table, id, updates) {
        const { data, error } = await supabase
            .from(table)
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    // Delete by id
    async delete(table, id) {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    // Real-time subscription
    subscribe(table, callback) {
        return supabase
            .channel(`${table}_changes`)
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: table },
                callback
            )
            .subscribe();
    },

    // Raw query access
    raw: supabase
};

export { db, supabase };
