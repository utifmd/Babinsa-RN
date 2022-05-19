package com.babinsa.Modules;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.Toast;

import androidx.core.content.ContextCompat;

import com.babinsa.MainActivity;
import com.babinsa.Utils.Consta;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

import javax.annotation.Nonnull;

import static androidx.appcompat.app.AppCompatActivity.RESULT_OK;

public class ImageModule extends SimpleViewManager<View>  {
    private ReactContext mContext;
    private ImageGroup imageGroup = null;

    @Nonnull
    @Override
    public String getName() {
        return "ImageModule";
    }

    public ImageModule(ReactContext context) {
        mContext = context;
        imageGroup = new ImageGroup(context);
    }

    @Nonnull
    @Override
    protected View createViewInstance(@Nonnull ThemedReactContext reactContext) {

        return new ImageGroup(mContext);
    }

    public void onActivityResult(MainActivity mainActivity, int requestCode, int resultCode, Intent data) {
        imageGroup.onActivityResult(mainActivity, requestCode, resultCode, data);
    }

    private class ImageGroup extends LinearLayout implements ActivityEventListener,
            LifecycleEventListener, // THIS METHOD IS USELESS IF YOU PLACED OVER VIEW MANAGER
            View.OnClickListener {
        private ReactContext mContext = null;
        private Uri mUri = null;
        private Bitmap mBitmap = null;
        private ImageWidget imageWidget = null;

        public ImageGroup(ReactContext context) {
            super(context);
            mContext = context;

            imageWidget = new ImageWidget(context);

            this.setOrientation(LinearLayout.VERTICAL);
            this.setLayoutParams(Consta.mchParams);
            this.addView(imageWidget);
            this.addView(columnView());

            context.addActivityEventListener(this);
            context.addLifecycleEventListener(this);
        }

        public LinearLayout columnView(){
            LinearLayout vrtView = new LinearLayout(mContext);

            vrtView.setOrientation(LinearLayout.HORIZONTAL);
            vrtView.setLayoutParams(Consta.mchParams);
            vrtView.setGravity(Gravity.CENTER);
            vrtView.addView(buttons(Consta.TYPE_CAMERA));
            vrtView.addView(buttons(Consta.TYPE_LIBRARY));

            return vrtView;
        }

        public ImageView buttons(Integer id){
            ImageView imageView = new ImageView(mContext);

            imageView.setId(id);
            imageView.setImageResource(id);
            imageView.setLayoutParams(Consta.cubeParams(35, 16));
            imageView.setScaleType(ImageView.ScaleType.FIT_XY);
            imageView.setColorFilter(Color.parseColor("#353535"));

            imageView.setOnClickListener(this);
            imageWidget.setOnClickListener(this);

            return imageView;
        }

        public void library(){
            Intent gallery = new Intent(Intent.ACTION_GET_CONTENT); //gallery.setAction(Intent.ACTION_GET_CONTENT);
            gallery.setType("image/*");
            mContext.startActivityForResult(gallery, Consta.REQ_CODE_LIBRARY, null);
        }

        public void capture(){
            Intent camera = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            if (ContextCompat.checkSelfPermission(mContext, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED){
                if (camera.resolveActivity(mContext.getPackageManager()) != null) mContext.startActivityForResult(camera, Consta.REQ_CODE_CAPTURE, null);
                else Toast.makeText(mContext, "there is no camera app on this phone.", Toast.LENGTH_SHORT).show();
            }else Toast.makeText(mContext, "please check camera permission on settings.", Toast.LENGTH_SHORT).show();
        }

        public void resetState(){
            imageWidget.mUri = null;
            imageWidget.mBitmap = null;
            imageWidget.initUi(mContext);
            mUri = null;
            mBitmap = null;
        }

        @SuppressLint("ResourceType")
        @Override
        public void onClick(View view) {
            //get id is not match please check the id of image view button
            if (view.getId() == Consta.TYPE_CAMERA){
                Log.d("capture();", "pressed.");
                capture();
            }else if(view.getId() == Consta.TYPE_LIBRARY){
                Log.d("capture();", "pressed.");
                library();
            }else if(view.getId() == Consta.TYPE_IMAGE_PLACE){
                Log.d("get.viewId()", "if(view.getId() == Consta.TYPE_IMAGE_PLACE)");
                if (mUri != null || mBitmap != null) {
                    Toast.makeText(mContext, "reset.", Toast.LENGTH_SHORT).show();
                    resetState();
                }
            }else {
                Toast.makeText(mContext, "there is no function on this.", Toast.LENGTH_SHORT).show();
            }
        }

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (resultCode == RESULT_OK && requestCode == Consta.REQ_CODE_LIBRARY){

                mUri = data.getData();

                imageWidget.mBitmap = null;
                imageWidget.mUri = mUri;
                imageWidget.initUi(mContext);
            }else if (resultCode == RESULT_OK && requestCode == Consta.REQ_CODE_CAPTURE){

                mBitmap = (Bitmap) (data.getExtras() != null ? data.getExtras().get("data") : null);
                imageWidget.mUri = null;
                imageWidget.mBitmap = mBitmap;
                imageWidget.initUi(mContext);
            }
        }

        @Override
        public void onNewIntent(Intent intent) {

        }

        @Override
        public void onHostResume() {
        }

        @Override
        public void onHostPause() {
            //resetState();
        }

        @Override
        public void onHostDestroy() {
            //resetState();
        }

    }
}
