package com.babinsa.Modules;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.content.ContextCompat;

import com.babinsa.R;
import com.babinsa.Utils.Consta;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.PermissionListener;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.google.android.gms.location.LocationServices;
import com.google.android.material.snackbar.Snackbar;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

public class LocationModule extends SimpleViewManager implements LocationListener, LifecycleEventListener {
    private static final String TAG = "LocationModule";
    private Activity mActivity;
    private ReactContext mContext;
    private LinearLayout mainView;
    private LocationManager locationManager;
    private Geocoder geocoder;
    private TextView title;
    private List<Consta.ModelItemMap> eventMap;
    private Boolean panelLocation = false;

    @NonNull
    @Override
    public String getName() {
        return TAG;
    }

    @SuppressLint("ResourceType")
    @NonNull
    @Override
    protected View createViewInstance(@NonNull ThemedReactContext reactContext) {
        mActivity = reactContext.getCurrentActivity();
        mContext = reactContext;

        mainView = Consta.lineView(reactContext, LinearLayout.HORIZONTAL);
        title = Consta.textView(reactContext, "Ketuk untuk menemukan lokasi.");
        ImageView imagePin = new ImageView(reactContext);
        eventMap = new ArrayList<>();

        imagePin.setImageResource(R.drawable.ic_person_pin_black_24dp);
        imagePin.setColorFilter(Color.WHITE);
        imagePin.setLayoutParams(new LinearLayout.LayoutParams(65, 65));

        title.setTextSize(18f);
        Log.d(TAG, "onCreate()"+ panelLocation.toString());

        mainView.addView(imagePin);
        mainView.addView(title);
        mainView.setOnClickListener(view -> fetchGps());

        locationManager = (LocationManager) reactContext.getSystemService(Context.LOCATION_SERVICE);
        geocoder = new Geocoder(mActivity, Locale.getDefault());

        reactContext.addLifecycleEventListener(this);

        return mainView;
    }

    private void fetchGps() { title.setText("Memuat..");
        if (ContextCompat.checkSelfPermission(mContext, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED &&
                ContextCompat.checkSelfPermission(mContext, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED){
            // request granted and loc enabling
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 2000, 1, this);

            // request granted, loc disabled and open setting to enabling
            if(!locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) &&
                    !locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER))
                if(mainView.isShown()){
                    Snackbar.make(mainView, "Anda perlu untuk menghidupkan lokasi.", Snackbar.LENGTH_SHORT)
                            .setAction("Pengaturan", view -> mContext.startActivityForResult(new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS), Consta.REQ_DEVICE_LOC, null))
                            .show();
                }else Toast.makeText(mContext, "Anda perlu untuk menghidupkan lokasi pada pengaturan.", Toast.LENGTH_SHORT).show();

        } else {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
                mActivity.requestPermissions(new String[]{ Manifest.permission.ACCESS_FINE_LOCATION }, Consta.REQ_PERM_F_LOCATION);

        }
    }

    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) { Log.d(TAG, "onRequestPermissionsResult");
        if (requestCode == Consta.REQ_PERM_F_LOCATION){ Log.d(TAG, "requestCode == Consta.REQ_PERM_F_LOCATION");
            if(grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) { Log.d(TAG, "Consta.REQ_PERM_F_LOCATION granted");
                if(!panelLocation) panelLocation = true;

            } else { Log.d(TAG, "Consta.REQ_PERM_F_LOCATION denied");
                if(panelLocation) panelLocation = false;
            }
        }
    }

    @Override
    public void onLocationChanged(Location location) { Log.d(TAG, "Latitude: "+ location.getLatitude()); Log.d(TAG, "Longitude: "+ location.getLongitude());

        try { Log.d(TAG, "geoCoder try fetch location..");
            List<Address> addresses = geocoder.getFromLocation(location.getLatitude(), location.getLongitude(), 1);
            if (addresses.size() > 0){
                Address address = addresses.get(0); Log.d(TAG, "Locality: "+ address.getLocality()); // KECAMATAN/NAGARI Log.d(TAG, "SubLocality: "+ address.getSubLocality()); // KELURAHAN/JORONG

                if(!panelLocation) panelLocation = true;

                title.setText(address.getLocality()+", "+address.getSubLocality()); //this.currentLocation = address.getLocality()+", "+address.getSubLocality();
                mainView.setOnClickListener(view -> { Log.d(TAG, "Current location pressed.");
                    Consta.alert(mContext, "Lokasi sekarang", address.getAddressLine(0)).show();
                });

                eventMap.add(new Consta.ModelItemMap("locality", address.getLocality()));
                eventMap.add(new Consta.ModelItemMap("subLocality", address.getSubLocality()));
                eventMap.add(new Consta.ModelItemMap("addressLine", address.getAddressLine(0)));


                //1. does not work in api 16 ~> Consta.sendEventMap(mContext, TAG, eventMap);
                Consta.sendEventMap(mContext, TAG, eventMap);

            }
        } catch (IOException e) { Log.d(TAG, "IOException: geoCoder -> "+ e.getLocalizedMessage());

            eventMap.add(new Consta.ModelItemMap("locality", "locality failed.")); eventMap.add(new Consta.ModelItemMap("subLocality", "subLocality failed.")); eventMap.add(new Consta.ModelItemMap("addressLine", "addressLine failed."));
            Consta.sendEventMap(mContext, TAG, eventMap);

            e.printStackTrace();
        } catch (IllegalArgumentException isInvalidLatLong){
            Log.d(TAG, "IllegalArgumentException: geoCoder -> "+ isInvalidLatLong.getLocalizedMessage());
        }
    }

    @Override
    public void onStatusChanged(String s, int i, Bundle bundle) {
        Log.d(TAG, "onStatusChanged: location.getLatitude()");
    }

    @Override
    public void onProviderEnabled(String s) {
        Log.d(TAG, "onProviderEnabled: location.getLatitude()");
    }

    @Override
    public void onProviderDisabled(String s) {
        Log.d(TAG, "onProviderDisabled: location.getLatitude()");
    }

    @Override
    public void onHostResume() {
        Log.d(TAG, "onHostResume()");
        if(panelLocation) fetchGps();

    }

    @Override
    public void onHostPause() {
        Log.d(TAG, "onHostPause()");

    }

    @Override
    public void onHostDestroy() {
        Log.d(TAG, "onHostDestroy()");

    }

}
