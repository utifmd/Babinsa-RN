package com.babinsa.Packages;

import android.view.MotionEvent;

import com.babinsa.MainActivity;
import com.babinsa.Modules.HtmlTextModule;
import com.babinsa.Modules.ImageDetail;
import com.babinsa.Modules.ImageModule;
import com.babinsa.Modules.LocationModule;
import com.babinsa.Modules.NotificationModule;
import com.babinsa.Modules.PdfModule;
import com.babinsa.Modules.PrefModule;
import com.babinsa.Modules.SlideListModule;
import com.babinsa.Modules.SubmitModule;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.Nonnull;

public class CusPackages implements ReactPackage {
    private ImageModule imageModule = null;
    private SubmitModule submitModule = null;
    private LocationModule locationModule;
    private PdfModule pdfModule = null;

    @Nonnull
    @Override
    public List<NativeModule> createNativeModules(@Nonnull ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new SlideListModule(reactContext));
        modules.add(new PrefModule(reactContext));
        modules.add(new NotificationModule(reactContext));

        return modules;
    }

    @Nonnull
    @Override
    public List<ViewManager> createViewManagers(@Nonnull ReactApplicationContext reactContext) {
        List<ViewManager> list = new ArrayList<>();

        imageModule = new ImageModule(reactContext);
        submitModule = new SubmitModule(reactContext);
        pdfModule = new PdfModule(reactContext);
        locationModule = new LocationModule();

        list.add(imageModule);
        list.add(submitModule);
        list.add(pdfModule);
        list.add(locationModule);
        list.add(new HtmlTextModule(reactContext));
        list.add(new ImageDetail());

        return list;
    }

    public boolean onTouchEvent(MainActivity mainActivity, MotionEvent event) {
        return pdfModule.onTouchEvent(mainActivity, event);
    }

//    public void onActivityResult(MainActivity mainActivity, int requestCode, int resultCode, Intent data) {
//        Log.d("onActivityResult", "onActivityResult");
//        if (imageModule != null) imageModule.onActivityResult(mainActivity, requestCode, resultCode, data);
//        if (submitModule != null) submitModule.onActivityResult(mainActivity, requestCode, resultCode, data);
//    }

}
