package com.babinsa.Modules;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.location.Geocoder;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;

import androidx.core.content.ContextCompat;

import android.provider.MediaStore;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import com.babinsa.MainActivity;
import com.babinsa.R;
import com.babinsa.Utils.Consta;
import com.babinsa.Utils.ImageLoader;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.google.android.material.bottomsheet.BottomSheetDialog;


import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import javax.annotation.Nonnull;

import static android.app.Activity.RESULT_OK;
import static android.content.Context.LOCATION_SERVICE;

public class SubmitModule extends SimpleViewManager<View> {
    private static final String TAG = "SubmitModule";
    private ReactContext mContext;
    private BaseView baseView = null;

    @Nonnull
    @Override
    public String getName() {
        return TAG;
    }

    public SubmitModule(ReactContext context) {
        mContext = context;
        baseView = new BaseView(context);
    }

    @Nonnull
    @Override
    protected View createViewInstance(@Nonnull ThemedReactContext reactContext) {
        return new BaseView(mContext); // <~ this context one makes imageUploader update realtime (1)
    }

    public void onActivityResult(MainActivity activity, int requestCode, int resultCode, Intent data) {
        baseView.onActivityResult(activity, requestCode, resultCode, data);
    }

    @ReactProp(name = "upload")
    public void upload(View view, String imgPath){ Log.d(TAG, "reactMethod called"); // reactMethod called
        if (imgPath.length() > 0) {
            baseView.imageWidget.uploadImage(baseView.mContext, TAG, imgPath);
        }
    }

    @ReactProp(name = "current")
    public void loadUp(View view, String path){ Log.d(TAG, "reactMethod loadupload called");
        if(path.length() > 0){
            //baseView.imageWidget.loadUpImage(baseView.mContext, TAG, path);
        }
    }

    private class BaseView extends LinearLayout implements View.OnClickListener, ActivityEventListener { //, LocationListener {
        private Activity mActivity = null;
        private ReactContext mContext = null;
        private LinearLayout mainView = null;
        private ImageWidget imageWidget = null;
        private BottomSheetDialog dialog = null;
        private AlertDialog alertDialog = null;
        private Uri mUri = null;
        private Bitmap mBitmap = null;
        private LocationManager locationManager = null;
        private Geocoder geocoder = null;
        private WritableMap writableMap;

        BaseView(ReactContext context) {
            super(context);
            this.setLayoutParams(Consta.mchParams);
            this.setOrientation(VERTICAL);

            mActivity = context.getCurrentActivity();
            mContext = context;
            writableMap = Arguments.createMap();

            locationManager = (LocationManager) context.getSystemService(LOCATION_SERVICE);
            geocoder = new Geocoder(mActivity, Locale.getDefault()); // <~ this context makes geoCoder getAddress

            imageWidget = new ImageWidget(context); // <~ this context one makes imageUploader update realtime (2)

            mainView = new LinearLayout(mContext);
            mainView.setOrientation(LinearLayout.VERTICAL);
            mainView.setLayoutParams(Consta.mchParams);
            mainView.setBackgroundColor(Consta.colorPrimary);

            updateList();

            imageWidget.setOnClickListener(this);

            ScrollView scrollVer = new ScrollView(mContext);
            scrollVer.setLayoutParams(Consta.mchParams);
            scrollVer.addView(mainView);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                dialog = new BottomSheetDialog(mActivity);
                dialog.create();
                dialog.setContentView(scrollVer);
            }else{
                AlertDialog.Builder nativeDialog = Consta.nativeAlert(mActivity, scrollVer);
                alertDialog = nativeDialog.create();
            }

            this.addView(imageWidget);

            context.addActivityEventListener(this);
        }

        @SuppressLint("ResourceType")
        private void updateList() {
            TextView title = Consta.textView(mContext, mContext.getString(R.string.selection_media));
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
                title.setTextAppearance(R.style.TextAppearance_AppCompat_Large);
            title.setId(Consta.ID_TITLE_LIST);
            title.setOnClickListener(this);

            ImageView itemGal = new ImageView(mContext);
            itemGal.setId(Consta.TYPE_LIBRARY);
            itemGal.setLayoutParams(Consta.cubeParams(96, 10));
            itemGal.setImageResource(R.drawable.ic_image_black_24dp);
            itemGal.setOnClickListener(this);

            ImageView itemCam = new ImageView(mContext);
            itemCam.setId(Consta.TYPE_CAMERA);
            itemCam.setLayoutParams(Consta.cubeParams(96, 10));
            itemCam.setImageResource(R.drawable.ic_photo_camera_black_24dp);
            itemCam.setOnClickListener(this);

            LinearLayout column = Consta.lineView(mContext, HORIZONTAL);
            column.addView(itemGal);
            column.addView(itemCam);

            mainView.addView(title, 0);
            mainView.addView(column, 1);
        }

        public void library() {
            Intent gallery = new Intent();
            gallery.setAction(Intent.ACTION_GET_CONTENT);
            gallery.setType("image/*");
            mContext.startActivityForResult(gallery, Consta.REQ_CODE_LIBRARY, null);
        }

        public void capture() {
            Intent camera = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            if (camera.resolveActivity(mContext.getPackageManager()) != null)
                if (ContextCompat.checkSelfPermission(mContext, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED)
                    mContext.startActivityForResult(camera, Consta.REQ_CODE_CAPTURE, null);
                else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
                    mActivity.requestPermissions(new String[]{Manifest.permission.CAMERA}, Consta.REQ_PERM_CAPTURE);//Toast.makeText(mContext, "please check camera permission on settings.", Toast.LENGTH_SHORT).show();
            else
                Toast.makeText(mContext, "there is no camera app on this phone.", Toast.LENGTH_SHORT).show();
        }

        @SuppressLint("ResourceType")
        @Override
        public void onClick(View view) {
            if (view.getId() == Consta.TYPE_IMAGE_PLACE) {
                if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) dialog.show();
                else alertDialog.show();

            }else if(view.getId() == Consta.TYPE_CAMERA){
                capture();

                if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP)
                    dialog.dismiss();
                else if(alertDialog.isShowing())
                    alertDialog.dismiss();
            }else if (view.getId() == Consta.TYPE_LIBRARY){
                library();

                if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP)
                    dialog.dismiss();
                else if(alertDialog.isShowing())
                    alertDialog.dismiss();
            }
        }

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (resultCode == RESULT_OK && requestCode == Consta.REQ_PERM_CAPTURE){
                Toast.makeText(mContext, "Akses kamera telah diizinkan.", Toast.LENGTH_SHORT).show();
            }else if (resultCode == RESULT_OK && requestCode == Consta.REQ_CODE_LIBRARY){
                mUri = data.getData();

                Log.d(TAG, "data.getData(); should run");

                imageWidget.mBitmap = null;
                imageWidget.mUri = data.getData(); // mUri; //imageUploader.clear();
                imageWidget.initUi(mContext);

                List<Consta.ModelItemMap> modelItemMaps = new ArrayList<>();
                Log.d(TAG, "onActivityResult: uri placed");
                modelItemMaps.add(new Consta.ModelItemMap("isImagePlaced", "true"));
                Consta.sendEventMap(mContext, TAG, modelItemMaps);

            }else if (resultCode == RESULT_OK && requestCode == Consta.REQ_CODE_CAPTURE){
                mBitmap = (Bitmap) (data.getExtras() != null ? data.getExtras().get("data") : null);
                imageWidget.mUri = null;
                imageWidget.mBitmap = mBitmap;
                imageWidget.initUi(mContext);

                List<Consta.ModelItemMap> modelItemMaps = new ArrayList<>();
                Log.d(TAG, "onActivityResult: bitmap placed");
                modelItemMaps.add(new Consta.ModelItemMap("isImagePlaced", "true"));
                Consta.sendEventMap(mContext, TAG, modelItemMaps);
            }else if (resultCode == RESULT_OK && requestCode == Consta.REQ_PERM_F_LOCATION){
                Toast.makeText(mContext, "Lokasi aktif.", Toast.LENGTH_SHORT).show();
            }
        }

        @Override
        public void onNewIntent(Intent intent) { }
    }
}