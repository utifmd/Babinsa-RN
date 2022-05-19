package com.babinsa.Modules;

import android.content.Context;
import android.util.Log;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.view.View;
import android.widget.ImageView;

import androidx.annotation.NonNull;

import com.babinsa.R;
import com.babinsa.Utils.Consta;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.HashMap;
import java.util.Map;

public class ImageDetail extends SimpleViewManager {
    private static final String TAG = "ImageDetail";
    private ReactContext mContext = null;
    private ImageView imageView = null;
    private Map<ImageView, String> objectImage = new HashMap<>();

    private ScaleGestureDetector mScaleGestureDetector = null;
    private float mFloat = 1.0f;

    @NonNull
    @Override
    public String getName() {
        return TAG;
    }

    @ReactProp(name = "load")
    public void currentUrl(View view, String url){ Log.d(TAG, "currentUrl");
        if(url.length() > 0) initView(url);
    }

    @NonNull
    @Override
    protected View createViewInstance(@NonNull ThemedReactContext reactContext) {
        this.mContext = reactContext;

        imageView = new ImageView(reactContext);
        imageView.setLayoutParams(Consta.mchParams);
        imageView.setAdjustViewBounds(true);
        imageView.setImageResource(R.drawable.ic_image_black_24dp);

        mScaleGestureDetector = new ScaleGestureDetector(reactContext, new ScaleListener());

        imageView.setOnTouchListener((view, motionEvent) -> { mScaleGestureDetector.onTouchEvent(motionEvent); return true; });

        return imageView;
    }

    private void initView(String mUrl) { Log.d(TAG, "initView");
        if(mUrl.length() > 0) {
            objectImage.put(imageView, mUrl);
            Consta.loadAsyncImages(mContext, objectImage);
        }
    }

    class ScaleListener extends ScaleGestureDetector.SimpleOnScaleGestureListener {
        @Override
        public boolean onScale(ScaleGestureDetector detector) {

            mFloat *= mScaleGestureDetector.getScaleFactor();
            mFloat = Math.max(0.1f, Math.min(mFloat, 10.0f));

            imageView.setScaleX(mFloat);
            imageView.setScaleY(mFloat);

            return true;
        }
    }
}
