package com.babinsa.Utils;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.util.Log;
import android.widget.ImageView;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

public class ImageLoader extends AsyncTask<String, Void, Bitmap> {
    private static final String TAG = "ImageLoader";
    private ImageView imageView;

    public ImageLoader(ImageView imageView) {
        this.imageView = imageView;
    }

    @Override
    protected void onPreExecute() { Log.d(TAG, "onPreExecute");
        super.onPreExecute();
    }

    @Override
    protected Bitmap doInBackground(String... strings) { Log.d(TAG, "doInBackground");
        Bitmap mBitmap = null;
        try {
            URL url = new URL(strings[0]);
            mBitmap = BitmapFactory.decodeStream(url.openConnection().getInputStream());


        } catch (MalformedURLException e) { Log.d(TAG, e.getLocalizedMessage());
            e.printStackTrace();
        } catch (IOException e) { Log.d(TAG, e.getLocalizedMessage());
            e.printStackTrace();
        }
        return mBitmap;
    }

    @Override
    protected void onPostExecute(Bitmap bitmap) { Log.d(TAG, "onPostExecute");
        super.onPostExecute(bitmap);

        if(imageView != null) { Log.d(TAG, "Imageview is applied");

            imageView.setImageBitmap(bitmap);
            imageView.setColorFilter(0);

        } else Log.d(TAG, "Imageview is null");
    }
}
