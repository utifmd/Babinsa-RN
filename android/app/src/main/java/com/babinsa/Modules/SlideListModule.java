package com.babinsa.Modules;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.os.Build;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.RequiresApi;

import com.babinsa.Utils.Consta;
import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableType;
import com.google.android.material.bottomsheet.BottomSheetDialog;

import java.util.ArrayList;
import java.util.Objects;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class SlideListModule extends ReactContextBaseJavaModule {
    private Activity mActivity;
    private ReactContext mContext;
    private BottomSheetDialog dialog;
    private AlertDialog alertDialog;

    public SlideListModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mActivity = reactContext.getCurrentActivity();
        mContext = reactContext;
    }

    @Nonnull
    @Override
    public String getName() {
        return "SlideListModule";
    }

    @ReactMethod
    public void show(String string, final Promise promise){ //Toast.makeText(mContext, "that file was not support.", Toast.LENGTH_SHORT).show();
        String[] list = string.split(",");

        ScrollView scrollView = new ScrollView(mContext);
        LinearLayout linearLayout = new LinearLayout(mContext);
        linearLayout.setLayoutParams(Consta.mchParams);
        linearLayout.setOrientation(LinearLayout.VERTICAL);
        linearLayout.setBackgroundColor(Consta.colorPrimary);

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M){
            dialog = new BottomSheetDialog(Objects.requireNonNull(mContext.getCurrentActivity()));
            dialog.create();
        }

        for (String item: list){
            TextView textView = new TextView(mContext);
            textView.setLayoutParams(Consta.heightParams(LinearLayout.LayoutParams.WRAP_CONTENT));
            textView.setText(item);
            textView.setTextSize(16f);
            textView.setPadding(10, 10, 10, 10);
            textView.setOnClickListener(view -> { //
                promise.resolve(item);
                if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M){
                    dialog.dismiss();
                }else{
                    if(alertDialog.isShowing())
                        alertDialog.dismiss();
                }
            });

            linearLayout.addView(textView);
        }

        scrollView.setLayoutParams(Consta.mchParams);
        scrollView.addView(linearLayout);

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M){
            dialog.setContentView(scrollView);
            dialog.show();
        }else{
            AlertDialog.Builder dialogNative = Consta.nativeAlert(Objects.requireNonNull(mContext.getCurrentActivity()), scrollView); // <~ that context is very powerFull
            alertDialog = dialogNative.create();
            alertDialog.show();
        }
    }
}
