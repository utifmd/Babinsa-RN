package com.babinsa.Utils;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SharedHandler {

    private SharedPreferences mPrefs;

    private static SharedHandler mSharedHandler;

    public SharedHandler(Context context, String name) {
        mPrefs = context.getSharedPreferences(name, Context.MODE_PRIVATE);
    }

    public static SharedHandler getInstance() {
        return mSharedHandler;
    }

    public static void init(Context context, String name) {
        if (mSharedHandler == null) {
            mSharedHandler = new SharedHandler(context, name);
        }
    }

    public String getString(String key) {
        return mPrefs.getString(key, "");
    }

    public Float getFloat(String key) {
        return mPrefs.getFloat(key, 0f);
    }

    public Long getLong(String key) {
        return mPrefs.getLong(key, 0);
    }

    public Boolean getBoolean(String key) {
        return mPrefs.getBoolean(key, false);
    }

    public Integer getInt(String key) {
        return mPrefs.getInt(key, 0);
    }

    public void clear() {
        mPrefs.edit().clear().commit();
    }

    public Map<String, ?> getAllSharedData(){
        return mPrefs.getAll();
    }

    public void deleteKey(String key) {
        SharedPreferences.Editor editor = mPrefs.edit();
        editor.remove(key);
        editor.commit();
    }

    public void putExtra(String key, Object value) {
        SharedPreferences.Editor editor = mPrefs.edit();
        if (value instanceof String) {
            editor.putString(key, (String) value).commit();
        } else if (value instanceof Boolean) {
            editor.putBoolean(key, (Boolean) value).commit();
        } else if (value instanceof Integer) {
            editor.putInt(key, (Integer) value).commit();
        } else if (value instanceof Long) {
            editor.putLong(key, (Long) value).commit();
        } else if (value instanceof Float) {
            editor.putFloat(key, (Float) value).commit();
        }
    }
}
