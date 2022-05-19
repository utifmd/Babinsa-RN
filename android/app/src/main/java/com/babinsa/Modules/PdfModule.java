package com.babinsa.Modules;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.pdf.PdfRenderer;
import android.os.Build;
import android.os.ParcelFileDescriptor;

import androidx.annotation.RequiresApi;

import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import com.babinsa.MainActivity;
import com.babinsa.Utils.Consta;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.google.android.material.bottomsheet.BottomSheetDialog;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicInteger;

import javax.annotation.Nonnull;

public class PdfModule extends SimpleViewManager<View> {
    private ReactContext mContext = null;
    private BaseView baseView = null;

    @Nonnull
    @Override
    public String getName() {
        return "PdfModule";
    }

    public PdfModule(ReactContext context){
        mContext = context;
        baseView = new BaseView(context);
    }

    @Nonnull
    @Override
    protected View createViewInstance(@Nonnull ThemedReactContext reactContext) {
        return new BaseView(reactContext);
    }

    public boolean onTouchEvent(MainActivity mainActivity, MotionEvent event) {
        return baseView.onTouchEvent(event); //return true;
    }

    private class BaseView extends LinearLayout implements View.OnClickListener{
        private Activity mActivity = null;
        private ReactContext mContext = null;
        private LinearLayout mainView = null;
        private ImageWidget imageWidget = null;
        private BottomSheetDialog dialog = null; //private AlertDialog.Builder dialogNative = null;
        private AlertDialog alertDialog = null;
        private File[] directory = null;
        private TextView itemView = null;
        private String mPath = null;
        private ScaleGestureDetector mScaleGestureDetector = null;
        private float mFloat = 1.0f;

        BaseView(ReactContext context) {
            super(context);
            this.setLayoutParams(Consta.mchParams);
            this.setOrientation(VERTICAL);

            mActivity = context.getCurrentActivity();
            mContext = context;

            mPath = Consta.PATH_DEFAULT;
            imageWidget = new ImageWidget(mContext);

            mainView = new LinearLayout(mContext);
            mainView.setOrientation(LinearLayout.VERTICAL);
            mainView.setLayoutParams(Consta.mchParams);
            mainView.setBackgroundColor(Consta.colorPrimary);

            updateList();

            imageWidget.setOnClickListener(this);
            mScaleGestureDetector = new ScaleGestureDetector(mContext, new ScaleListener());

            ScrollView scrollVer = new ScrollView(mContext);
            scrollVer.setLayoutParams(Consta.mchParams);
            scrollVer.addView(mainView);

            if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M){
                dialog = new BottomSheetDialog(mContext); dialog.create();
                dialog.setContentView(scrollVer);
            }else {
                alertDialog = Consta.nativeAlert(mActivity, scrollVer).create();
            }

            this.addView(imageWidget);
        }

        private void updateList() {
            mainView.removeAllViewsInLayout();
            int padding = 10;
            TextView title = new TextView(mContext);
            title.setId(Consta.ID_TITLE_LIST);
            title.setPadding(padding, padding, padding, padding);
            title.setOnClickListener(this);
            title.setText(mPath);
            mainView.addView(title, 0);
            directory = new File(mPath).listFiles();
            if(directory != null){
                for (File file : directory) {
                itemView = new TextView(mContext);
                itemView.setLayoutParams(Consta.wrapParams);
                itemView.setPadding(padding, padding, padding, padding);
                itemView.setText(file.getName());
                itemView.setTextSize(16f);
                itemView.setOnClickListener(view -> {
                    String extension = file.getName().substring(file.getName().length() - 4);
                    if (file.isFile()) {
                        if(!extension.equals(".pdf")) Toast.makeText(mContext, "pastikan anda memilih file pdf.", Toast.LENGTH_SHORT).show();
                        else {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP)
                                renderPdf(file);
                            else Toast.makeText(mContext, "maaf, versi android anda tidak mendukung untuk fitur ini.", Toast.LENGTH_SHORT).show();
                        }
                    }
                    else if (file.isDirectory()) mPath = mPath + "/" + file.getName();
                    else Toast.makeText(mContext, "that file was not support.", Toast.LENGTH_SHORT).show();

                    updateList();
                });

                mainView.addView(itemView);
            }
            }
        }

        @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
        @SuppressLint("ClickableViewAccessibility")
        private void renderPdf(File file) {
            try {
                AtomicInteger currentPage = new AtomicInteger();

                //Bitmap bitmap = Bitmap.createBitmap(REQ_WIDTH, REQ_HEIGHT, Bitmap.Config.ARGB_4444);
                PdfRenderer pdfRenderer = new PdfRenderer(ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY));

                if(currentPage.get() > pdfRenderer.getPageCount()) {
                    currentPage.set(pdfRenderer.getPageCount() - 1);
                }

                PdfRenderer.Page mCurrentPage = pdfRenderer.openPage(currentPage.get());

                Bitmap bitmap = Bitmap.createBitmap(
                        getResources().getDisplayMetrics().densityDpi * mCurrentPage.getWidth() / 72,
                        getResources().getDisplayMetrics().densityDpi * mCurrentPage.getHeight() / 72,
                        Bitmap.Config.ARGB_8888
                );

                mCurrentPage.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);

                imageWidget.setImageBitmap(bitmap);
                imageWidget.setBackgroundColor(Color.WHITE);
                imageWidget.setOnTouchListener((view, event) -> {
                    mScaleGestureDetector.onTouchEvent(event);
                    return true;
                });

                //imageUploader.setOnClickListener(view -> currentPage.getAndIncrement());
//                imageUploader.setOnLongClickListener(view -> {
//                    renderPdf(file, matrix);
//                    return true;
//                });

                imageWidget.invalidate();

                dialog.dismiss();
            } catch (IOException e) {
                e.printStackTrace();
                dialog.dismiss();
            }
        }

        @SuppressLint("ResourceType")
        @Override
        public void onClick(View view) {
            if (view.getId() == Consta.TYPE_IMAGE_PLACE) {

                if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
                    dialog.show();
                else
                    alertDialog.show();

            }else if(view.getId() == Consta.ID_TITLE_LIST) {
                String
                        lastPath = mPath.substring(mPath.lastIndexOf("/")),
                        previousPath = mPath.replace(lastPath, "");

                if (previousPath.length() >= Consta.PATH_DEFAULT.length()){
                    mPath = previousPath;
                    updateList();
                }
            }
        }

//        @Override
//        public boolean onTouchEvent(MotionEvent event) {
//            mScaleGestureDetector.onTouchEvent(event);
//            return true;
//        }

        private class ScaleListener extends ScaleGestureDetector.SimpleOnScaleGestureListener{
            @Override
            public boolean onScale(ScaleGestureDetector detector) {
                mFloat *= mScaleGestureDetector.getScaleFactor();
                mFloat = Math.max(0.1f, Math.min(mFloat, 10.0f));
                imageWidget.setScaleX(mFloat);
                imageWidget.setScaleY(mFloat);
                return true;
            }
        }
    }
}