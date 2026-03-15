import { useState, useEffect } from 'react';
import { db } from '../services/dbClient';

export const useProfileData = (key: string, defaultValue: any) => {
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: dbData, error } = await db
          .from('site_content')
          .select('content')
          .eq('section', key)
          .single();

        if (error) {
          console.log(`No data found in database for ${key}, using default.`);
          setData(defaultValue);
        } else if (dbData) {
          setData(dbData.content);
        }
      } catch (err) {
        console.error(`Error fetching ${key} from database:`, err);
        setData(defaultValue);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, defaultValue]);

  return { data, loading };
};
