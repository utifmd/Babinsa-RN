package com.babinsa.Utils;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Environment;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.RequiresApi;

import com.babinsa.R;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.material.bottomsheet.BottomSheetDialog;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class Consta {
    public static final Integer REQ_CODE_LIBRARY = 1001;
    public static final Integer REQ_CODE_CAPTURE = 1002;
    public static final Integer REQ_PERM_CAPTURE = 2002;
    public static final Integer REQ_DEVICE_LOC = 3001;
    public static final Integer REQ_PERM_F_LOCATION = 2003;
    public static final Integer REQ_PERM_C_LOCATION = 2004;
    public static final Integer TYPE_LIBRARY = R.drawable.ic_library_add_black_24dp;
    public static final Integer TYPE_CAMERA = R.drawable.ic_photo_camera_black_24dp;
    public static final Integer TYPE_IMAGE_PLACE = R.drawable.ic_image_black_24dp;
    public static final Integer colorPrimaryDark = Color.parseColor("#353535");
    public static final Integer colorPrimary = Color.parseColor("#254F6E");
    public static final String PATH_DEFAULT = Environment.getExternalStorageDirectory().toString();
    public static final LinearLayout.LayoutParams mchParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT);
    public static final LinearLayout.LayoutParams wrapParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
    public static final Integer ID_TITLE_LIST = 2001;

    public static LinearLayout.LayoutParams heightParams(Integer height) {
        return new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, height);
    }

    public static LinearLayout.LayoutParams cubeParams(Integer size, Integer margin) {
        LinearLayout.LayoutParams cube = new LinearLayout.LayoutParams(size, size);
        cube.setMargins(margin, margin, margin, margin);
        return cube;
    }
    public static LinearLayout.LayoutParams cubeWrapParams(Integer margin) {
        LinearLayout.LayoutParams cube = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        cube.setMargins(margin, margin, margin, margin);
        return cube;
    }
    public static TextView textView(Context context, String string){
        TextView text =  new TextView(context);
        text.setText(string);
        text.setLayoutParams(wrapParams);
        text.setPadding(10, 10, 10, 10);

        return text;
    }
    public static LinearLayout lineView(Context context, int orientation){
        LinearLayout layout = new LinearLayout(context);
        layout.setOrientation(orientation);
        layout.setGravity(Gravity.CENTER);
        layout.setLayoutParams(wrapParams);
        layout.setPadding(16, 16, 16, 16);

        return layout;
    }
    public static void applyEvent(ReactContext context, String eventName, WritableMap events){
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, events);
    }
    public static void sendEventMap(ReactContext context, String eventName, List<ModelItemMap> listItem){
        WritableMap writableMap = Arguments.createMap();

        for (int i = 0; i < listItem.size(); i++){
            writableMap.putString(listItem.get(i).key, listItem.get(i).value);
        }

        applyEvent(context, eventName, writableMap);
    }
    public static class ModelItemMap{
        String key;
        String value;

        public ModelItemMap(String key, String value) {
            this.key = key;
            this.value = value;
        }
    }
    public static AlertDialog.Builder alert(Context context, String title, String mes){
        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        builder.create();
        builder.setTitle(title);
        builder.setMessage(mes);

        return builder;
    }

    public static AlertDialog.Builder nativeAlert(Context context, View layout){
        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        builder.setView(layout);
        builder.create();

        return builder;
    }

    public static BottomSheetDialog btmSheet(Context context, View view){
        BottomSheetDialog dialog = new BottomSheetDialog(context);
        dialog.setContentView(view);

        return dialog;
    }

    public static Bitmap loadImageFromURL(String path){
        try {
            URL url = new URL(path);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoInput(true);
            connection.connect();
            InputStream input = connection.getInputStream();

            return BitmapFactory.decodeStream(input);
        } catch (IOException e) { // Log exception
            Log.d("getBitmapFromURL", e.getLocalizedMessage());
            return null;
        }
    }

//    public static class ScaleListener{
//
//    }

    public static void loadAsyncImages(Context context, Map<ImageView, String> passedImages){

        for (Map.Entry<ImageView, String> passedImage: passedImages.entrySet()){
            new ImageUrlApplier(context, new ImageUrlApplier.Listener() {
                @Override
                public void onComplete(Bitmap bitmap) { Log.d("ImageUrlApplier", "onComplete done.");
                    passedImage.getKey().setImageBitmap(bitmap);
                }

                @Override
                public void onFailure(String reason) { Log.d("loadAsyncImages", reason);
                    //Toast.makeText(context, reason, Toast.LENGTH_LONG).show();
                }
            }).execute(passedImage.getValue());
        }
    }

    public static class ImageUrlApplier extends AsyncTask<String, Void, Bitmap>{
        private Context mContext;
        private Listener mListener;

        public ImageUrlApplier(Context context, Listener listener){
            mContext = context;
            mListener = listener;
        }

        public interface Listener{
            void onComplete(final Bitmap bitmap);
            void onFailure(final String reason);
        }

        @Override
        protected void onPreExecute() { Log.d("ImageUrlApplier", "onPreExecute done.");
            super.onPreExecute();
        }

        @Override
        protected Bitmap doInBackground(String... strings) { Log.d("ImageUrlApplier", "doInBackground done.");
            Bitmap bitmap = null;

            try {
                bitmap = BitmapFactory.decodeStream(new URL(strings[0]).openStream());
            } catch (MalformedURLException e) {
                e.printStackTrace();
                mListener.onFailure(e.getLocalizedMessage());
            } catch (IOException e) {
                e.printStackTrace();
                mListener.onFailure(e.getLocalizedMessage()); 
            }


            return bitmap;
        }

        @Override
        protected void onPostExecute(Bitmap bitmap) { Log.d("ImageUrlApplier", "onPostExecute done.");
            super.onPostExecute(bitmap);

            if (bitmap != null){
                mListener.onComplete(bitmap);
            }else{
                mListener.onFailure("Returned bitmap is null.");
            }
        }

    }

    public static class getBitmapFromURL extends AsyncTask<String, Void, Bitmap> {

        @Override
        protected Bitmap doInBackground(String... strings) {
            Bitmap bitmap = null;
            try {
                URL url = new URL(strings[0]);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setDoInput(true);
                connection.connect();
                InputStream input = connection.getInputStream();

                bitmap = BitmapFactory.decodeStream(input);
            } catch (IOException e) {
                // Log exception
                Log.d("getBitmapFromURL", e.getLocalizedMessage());
            }

            return bitmap;
        }

        @Override
        protected void onPostExecute(Bitmap bitmap) {
            super.onPostExecute(bitmap);

            Log.d("grtBitmapFromURL", bitmap.toString());
        }
    }
}


//public class MainActivity extends AppCompatActivity {
//    private ScaleGestureDetector gestureDetector;
//    private float mFloat = 1.0f;
//    private ImageView imageView = null;
//
//    @Override
//    protected void onCreate(Bundle savedInstanceState) {
//        super.onCreate(savedInstanceState);
//        setContentView(R.layout.activity_main);
//
//        File[] directory = new File(Environment.getRootDirectory().getPath()).listFiles();
//        final List<String> child = new ArrayList<>();
//
//        for (File file : directory) {
//            child.add(file.getName());
//        }
//
//        final ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, android.R.id.text1, child);
//
//        ListView listView = findViewById(R.id.listView);
//
//        listView.setAdapter(adapter);
//        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
//            @Override
//            public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {
//                Toast.makeText(MainActivity.this, child.get(i), Toast.LENGTH_SHORT).show();
//                adapter.clear();
//            }
//        });
//
//        LinearLayout mainLayout = findViewById(R.id.mainLayout);
//        LinearLayout.LayoutParams param = new LinearLayout.LayoutParams(75, 75);
//        param.gravity = Gravity.CENTER;
//        imageView = new ImageView(this);
//        imageView.setLayoutParams(param);
//        imageView.setImageResource(R.drawable.ic_launcher_background);
//
//
//        gestureDetector = new ScaleGestureDetector(this, new ScaleListener());
//
//
//        mainLayout.addView(imageView);
//
//    }
//
//    @Override
//    public boolean onTouchEvent(MotionEvent event) {
//        gestureDetector.onTouchEvent(event);
//
//        return true;
//    }
//
//    private class ScaleListener extends ScaleGestureDetector.SimpleOnScaleGestureListener {
//        @Override
//        public boolean onScale(ScaleGestureDetector scaleGestureDetector){
//            mFloat *= scaleGestureDetector.getScaleFactor();
//            mFloat = Math.max(0.1f, Math.min(mFloat, 10.0f));
//            imageView.setScaleX(mFloat);
//            imageView.setScaleY(mFloat);
//
//            return true;
//        }
//    }
//}