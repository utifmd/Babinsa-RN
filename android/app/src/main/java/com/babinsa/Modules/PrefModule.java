package com.babinsa.Modules;

import android.app.Activity;

import androidx.appcompat.app.AppCompatActivity;

import com.babinsa.Utils.SharedHandler;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import javax.annotation.Nonnull;

public class PrefModule extends ReactContextBaseJavaModule {
    private ReactContext mContext = null;

    @Nonnull
    @Override
    public String getName() {
        return "PrefModule";
    }

    public PrefModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
    }

    @ReactMethod
    public void apply(String key, String value) {
        SharedHandler.init(getReactApplicationContext(), key);
        Activity activity = mContext.getCurrentActivity();
        SharedHandler.getInstance().putExtra(key, value);
    }

    @ReactMethod
    public void load(String key, Callback successCallback){
        SharedHandler.init(getReactApplicationContext(), key);
        String value = SharedHandler.getInstance().getString(key);
        successCallback.invoke(value);
    }

    @ReactMethod
    public void clear(String key){
        SharedHandler.init(getReactApplicationContext(), key);
        SharedHandler.getInstance().clear();
    }
}
