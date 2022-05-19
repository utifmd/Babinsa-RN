package com.babinsa.Modules;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.media.RingtoneManager;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.babinsa.MainActivity;
import com.babinsa.R;
import com.babinsa.Utils.Consta;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class NotificationModule extends ReactContextBaseJavaModule { // implements ActivityEventListener {
    private static final String TAG = "NotificationModule";
    private ReactApplicationContext mContext;
    private String mTitle = "DefaultTitle.com";
    private String mMessage = "this message according to optional setup from server.";
    private String mImage = "";
    private static final int NOTIFICATION_ID = 101;
    private static final int NOTIF_INTENT_CODE = 40404;
    private static final String NOTIFICATION_CHANNEL_ID = "channel_id";
    private static final String CHANNEL_NAME = "Notification Channel";
    private NotificationManagerCompat managerCompat;
    private NotificationManager manager;

    @NonNull
    @Override
    public String getName() {
        return TAG;
    }

    @ReactMethod
    void show(Boolean isShow, ReadableMap values){// Log.d(TAG, "reactMethod passed.");
        if(isShow){ // Log.d(TAG, "reactMethod passed true.");
            if(values != null){

                ReadableMap data = values.getMap("data");
                if(data != null){
                    mTitle = data.getString("title");
                    mMessage = data.getString("body");
                    mImage = data.getString("image");

                    onHeadsUpNotification();
                }
            }
        }
    }

    public NotificationModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
    }

    private void onHeadsUpNotification(){  Log.d(TAG, "onHeadsUpNotification passed.");
        Intent intent = new Intent(mContext, MainActivity.class);
        PendingIntent openApp = PendingIntent.getActivity(mContext, NOTIF_INTENT_CODE, intent, PendingIntent.FLAG_UPDATE_CURRENT); //PendingIntent broadcast = PendingIntent.getBroadcast(mContext, 0 /* Request code */, intent, PendingIntent.FLAG_UPDATE_CURRENT);
        NotificationCompat.Builder builder = new NotificationCompat.Builder(mContext, NOTIFICATION_CHANNEL_ID);

        builder.setContentIntent(openApp);
        builder.setSmallIcon(R.drawable.ic_person_pin_white_24dp);
        builder.setContentTitle(mTitle);
        builder.setContentText(mMessage);
        builder.setLargeIcon(BitmapFactory.decodeResource(mContext.getResources(), R.mipmap.ic_launcher_round)); //builder.setPriority(NotificationCompat.PRIORITY_DEFAULT);
        builder.setPriority(NotificationCompat.PRIORITY_HIGH);
        builder.setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION));
        builder.setVibrate(new long[0]);
        builder.setWhen(0); //builder.setVibrate(new long[] {500, 500, 500, 500});
        builder.setVisibility(NotificationCompat.VISIBILITY_PUBLIC);
        builder.setAutoCancel(true);
        builder.setTicker(mTitle);
        builder.setStyle(new NotificationCompat.BigTextStyle().bigText(mMessage));
        builder.setStyle(new NotificationCompat.BigPictureStyle().bigPicture(Consta.loadImageFromURL(mImage)));

        manager = (NotificationManager) mContext.getSystemService(Context.NOTIFICATION_SERVICE);
        managerCompat = NotificationManagerCompat.from(mContext); //(NotificationManager) mContext.getSystemService(Context.NOTIFICATION_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) { Log.d(TAG, "Notification API >= O");
            NotificationChannel channel = new NotificationChannel(NOTIFICATION_CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_HIGH);
            channel.enableLights(true);
            channel.enableVibration(true);
            channel.setLightColor(Color.GREEN);
            channel.setVibrationPattern(new long[] { 500, 500, 500, 500, 500});
            channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);

            manager.createNotificationChannel(channel);
            managerCompat.notify(NOTIFICATION_ID, builder.build());
        }else{ Log.d(TAG, "Notification API > 19");
            manager.notify(NOTIFICATION_ID, builder.build());
        }
    }
}


//            Notification notification = new Notification.Builder(mContext)
//                .setContentTitle(mTitle)
//                .setContentText(mMessage)
//                .setSmallIcon(R.drawable.ic_person_pin_white_24dp)
//                .setLargeIcon(BitmapFactory.decodeResource(mContext.getResources(), R.mipmap.ic_launcher_round))
//                .setPriority(Notification.PRIORITY_HIGH)
//                .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
//                .setVibrate(new long[0])
//                .setContentIntent(openApp) //.setFullScreenIntent(openApp, true)
//                .setAutoCancel(true)
//                .setStyle(new Notification.BigTextStyle().bigText(mMessage))
//                .setStyle(new Notification.BigPictureStyle().bigPicture(Consta.getBitmapFromURL(mImage)))
//                .build();
//
//    @Override
//    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
//        switch (resultCode){
//            case RESULT_OK: { Log.d(TAG, "RESULT_OK");
//                if(requestCode == NOTIF_INTENT_CODE){
//                    managerCompat.cancel(NOTIFICATION_ID);
//                }
//            }
//            case RESULT_CANCELED:{
//                Log.d(TAG, "RESULT_CANCELED");
//            }
//            default:{
//                Log.d(TAG, "RESULT_CANCELED default");
//            }
//        }
//    }
//
//    @Override
//    public void onNewIntent(Intent intent) {
//
//    }
// }