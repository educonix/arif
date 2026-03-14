import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const useProfileData = (key: string, defaultValue: any) => {
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: supabaseData, error } = await supabase
          .from('site_content')
          .select('content')
          .eq('section', key)
          .single();

        if (error) {
          console.log(`No data found in Supabase for ${key}, using default.`);
          setData(defaultValue);
        } else if (supabaseData) {
          setData(supabaseData.content);
        }
      } catch (err) {
        console.error(`Error fetching ${key} from Supabase:`, err);
        setData(defaultValue);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, defaultValue]);

  return { data, loading };
};
