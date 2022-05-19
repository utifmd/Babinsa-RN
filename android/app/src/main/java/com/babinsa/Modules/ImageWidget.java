package com.babinsa.Modules;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.net.Uri;
import android.os.AsyncTask;
import android.util.Log;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.widget.AppCompatImageView;

import com.babinsa.R;
import com.babinsa.Utils.Consta;
import com.babinsa.Utils.ImageLoader;
import com.facebook.react.bridge.ReactContext;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.UploadTask;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@SuppressLint("ViewConstructor")
public class ImageWidget extends AppCompatImageView implements OnSuccessListener<UploadTask.TaskSnapshot>, OnFailureListener {
    private static final String TAG = "ImageWidget";
    public Uri mUri = null;
    public Bitmap mBitmap = null;
    public FirebaseFirestore db = null;
    public FirebaseStorage storage = null;
    public StorageReference storageRef = null;

    private StorageReference refPath;
    private ReactContext mContext;
    private String mTagSender;

    public ImageWidget(ReactContext context) {
        super(context);

        db = FirebaseFirestore.getInstance();
        storage = FirebaseStorage.getInstance();
        storageRef = storage.getReference();

        initUi(context);
    }

    @SuppressLint("ResourceType")
    public void initUi(Context context){

        if (mUri != null) { Log.d(TAG, "mUri is getting");
            this.setImageURI(mUri);
            this.setColorFilter(0);
        }else if (mBitmap != null){ Log.d(TAG, "mBitmap is getting");
            this.setImageBitmap(mBitmap);
            this.setColorFilter(0);
        }else {
            this.setImageURI(null);
            this.setImageBitmap(null);
            this.setImageResource(R.drawable.ic_image_black_24dp);
            this.setColorFilter(Color.parseColor("#353535"));
        }

        this.setId(Consta.TYPE_IMAGE_PLACE); //this.setBackgroundColor(Color.parseColor("#254F6E"));
        this.setScaleType(ScaleType.FIT_CENTER);
        this.setLayoutParams(Consta.wrapParams);
        this.setAdjustViewBounds(true);
        //this.setLayoutParams(Consta.cubeParams(230, 10));
    }

    public void uploadImage(ReactContext context, String tagSender, String imgPath){
        mContext = context;
        mTagSender = tagSender;
        refPath = storageRef.child("images/"+imgPath);
        try {
            if (mUri != null){
                Log.d(TAG, "task is mUri.");

                refPath.putFile(mUri).addOnSuccessListener(this).addOnFailureListener(this);
            }else if (mBitmap != null){
                Log.d(TAG, "task is mBitmap.");
                ByteArrayOutputStream baOs = new ByteArrayOutputStream();
                mBitmap.compress(Bitmap.CompressFormat.PNG, 100, baOs);
                byte[] mBitmapData = baOs.toByteArray();

                refPath.putBytes(mBitmapData).addOnSuccessListener(this).addOnFailureListener(this);
            }

        }catch (Exception e){
            Log.d(TAG, e.getLocalizedMessage());
        }
    }

    @Override
    public void onSuccess(UploadTask.TaskSnapshot taskSnapshot) {
        refPath.getDownloadUrl().addOnSuccessListener(uploadedUrl -> {
            Log.d(TAG, "onSuccess() uploaded url should received.");
            List<Consta.ModelItemMap> urls = new ArrayList<>();

            urls.add(new Consta.ModelItemMap("photoSource", uploadedUrl.toString()));
            urls.add(new Consta.ModelItemMap("isUploaded", uploadedUrl.toString()));
            Consta.sendEventMap(mContext, mTagSender, urls);
        }).addOnFailureListener(this);
    }

    @Override
    public void onFailure(@NonNull Exception e) {
        Log.d(TAG, "put file failed: "+ e.getLocalizedMessage());
    }
}