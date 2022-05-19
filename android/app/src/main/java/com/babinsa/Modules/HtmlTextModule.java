package com.babinsa.Modules;

import android.content.Context;
import android.os.Build;
import android.text.Html;
import android.util.Log;
import android.view.View;
import android.webkit.WebView;
import android.widget.TextView;
import android.graphics.Color;
import android.graphics.ColorFilter;

import androidx.annotation.NonNull;
import androidx.appcompat.widget.AppCompatTextView;

import com.babinsa.Utils.Consta;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.uimanager.annotations.ReactProp;

public class HtmlTextModule extends SimpleViewManager {
    private static final String TAG = "HtmlTextModule";
    private HtmlView htmlView = null;

    public HtmlTextModule(ReactApplicationContext reactContext) {
    }

    @NonNull
    @Override
    public String getName() {
        return TAG;
    }

    @ReactProp(name = "apply")
    public void apply(View v, String string){
        if(!string.equals("")){
            this.htmlView.initViews(string);
        }
    }

    @NonNull
    @Override
    protected View createViewInstance(@NonNull ThemedReactContext reactContext) {
        htmlView = new HtmlView(reactContext);
        
        return htmlView;
    }


    class HtmlView extends //WebView {
        AppCompatTextView {

        public HtmlView(Context context) {
            super(context);
            this.setLayoutParams(Consta.wrapParams);
            this.setTextColor(Consta.colorPrimaryDark);
        }

        public void initViews(String brandNew){
//            this.loadDataWithBaseURL(null, brandNew, "text/html", "utf-8", null);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                this.setText(Html.fromHtml(brandNew, Html.FROM_HTML_MODE_COMPACT));
            } else {
                this.setText(Html.fromHtml(brandNew));
            }
        }
    }
}
