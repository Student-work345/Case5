package app.arm.courier;

import java.io.IOException;

import org.apache.http.client.ClientProtocolException;

import org.apache.http.client.HttpClient;

import org.apache.http.client.ResponseHandler;

import org.apache.http.client.methods.HttpPost;

import org.apache.http.impl.client.BasicResponseHandler;

import org.apache.http.impl.client.DefaultHttpClient;

import android.app.Service;

import android.content.Context;

import android.content.Intent;

import android.content.SharedPreferences;

import android.os.Bundle;

import android.os.IBinder;

import android.location.Location;

import android.location.LocationListener;

import android.location.LocationManager;

public class GPS_Service extends Service implements LocationListener {

Intent in;

SharedPreferences mSettings;

public static final String APP_PREFERENCES = "mysettings";

public static final String APP_PREFERENCES_STATUS_TEXT = "status_text";

public static final String APP_PREFERENCES_STATUS = "status";

public static final String APP_PREFERENCES_STATUS_ID = "status_id";

public static final String APP_PREFERENCES_SERVER = "server";

public static final String APP_PREFERENCES_LOGIN = "login";

public static final String APP_PREFERENCES_PASSWORD = "password";

String user;

String password;

String lat;

String lon;

String status;

String status_text;

String server;

String url;

@Override

public IBinder onBind(Intent arg0) {

// TODO Auto-generated method stub

return null;

}

@Override

public void onCreate()

{

super.onCreate();

//Связываем менеджер и сервис

LocationManager myManager = (LocationManager) getSystemService(LOCATION_SERVICE);

//Назначаем слушателя

myManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 30000, 10, this);

in = new Intent("AppService");

in.putExtra("GPS_Lat","54.184841");

in.putExtra("GPS_Lon","45.174256");

in.putExtra("url","url");

sendBroadcast(in);

}

public void onLocationChanged(Location location) {

// TODO Auto-generated method stub

mSettings = getSharedPreferences(APP_PREFERENCES, Context.MODE_PRIVATE);

if(mSettings.contains(APP_PREFERENCES_LOGIN)) {

user = mSettings.getString(APP_PREFERENCES_LOGIN, "");

}

if(mSettings.contains(APP_PREFERENCES_PASSWORD)) {

password = mSettings.getString(APP_PREFERENCES_PASSWORD, "");

}

if(mSettings.contains(APP_PREFERENCES_STATUS)) {

status = java.net.URLEncoder.encode(mSettings.getString(APP_PREFERENCES_STATUS, ""));

}

if(mSettings.contains(APP_PREFERENCES_STATUS_TEXT)) {

status_text = java.net.URLEncoder.encode(mSettings.getString(APP_PREFERENCES_STATUS_TEXT, ""));

}

if(mSettings.contains(APP_PREFERENCES_SERVER)) {

server = mSettings.getString(APP_PREFERENCES_SERVER, "");

}

url = "http://" + server + "/receiver.php?user="+user+"&password="+password+"&lat="+location.getLatitude()+"&lon="+location.getLongitude()+"&status="+status+"&status_text="+status_text;

HttpClient httpclient = new DefaultHttpClient();

HttpPost httppost = new HttpPost(url);

ResponseHandler<String> responseHandler = new BasicResponseHandler();

try {

httpclient.execute(httppost, responseHandler);

} catch (ClientProtocolException e) {

// TODO Auto-generated catch block

e.printStackTrace();

} catch (IOException e) {

// TODO Auto-generated catch block

e.printStackTrace();

}

in = new Intent("AppService");

in.putExtra("GPS_Lat",""+location.getLatitude());

in.putExtra("GPS_Lon",""+location.getLongitude());

in.putExtra("url",""+url);

sendBroadcast(in);

}

public void onProviderDisabled(String arg0) {

// TODO Auto-generated method stub

}

public void onProviderEnabled(String arg0) {

// TODO Auto-generated method stub

}

public void onStatusChanged(String arg0, int arg1, Bundle arg2) {

// TODO Auto-generated method stub

}

}

Класс RouteScreen

package app.arm.courier;

import java.io.IOException;

import java.util.ArrayList;

import java.util.List;

…

public class RouteScreen extends Activity {

EditText Txt;

Button Btn_count;

String url = "";

String API_key;

Float dist;

Float time;

Float lat;

Float lon;

String route;

String response;

double start_lat;

double start_lon;

double finish_lat;

double finish_lon;

String move_type;

MapView mMapView;

MapController mMapController;

PathOverlay myPath;

GridView gridview;

TextView txt_dist;

TextView txt_time;

List <Coord> routeList;

static class Coord {

Float lat;

Float lon;

public Coord(Float lat, Float lon) {

this.lat = lat;

this.lon = lon;

}

}

@Override

public void onCreate(Bundle savedInstanceState) {

super.onCreate(savedInstanceState);

setContentView(R.layout.contacts);

Btn_count = (Button) findViewById(R.id.btn_count);

mMapView = (MapView) findViewById(R.id.openmapview);

txt_dist = (TextView) findViewById(R.id.txt_dist);

txt_time = (TextView) findViewById(R.id.txt_time);

start_lon = 45.174256;

start_lat = 54.184841;

API_key = "56eded06210846ecbb758f29e7c28152";

move_type = "bicycle";

mMapController = mMapView.getController();

mMapView.setClickable(true);

mMapView.setTileSource(TileSourceFactory.MAPNIK);

mMapView.setBuiltInZoomControls(true);

mMapView.setMultiTouchControls(true);

mMapController.setZoom(13);

mMapController.setCenter(new GeoPoint((int) (start_lat * 1e6),(int) (start_lon * 1e6)));

routeList = new ArrayList<Coord>();

DummyOverlay dumOverlay = new DummyOverlay(this);

List<Overlay> listOfOverlays = mMapView.getOverlays();

listOfOverlays.clear();

listOfOverlays.add(dumOverlay);

startService(new Intent(this,GPS_Service.class));

}

public class DummyOverlay extends org.osmdroid.views.overlay.Overlay {

float Lat;

float Lon;

Context con;

private Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

public DummyOverlay(Context ctx) {

super(ctx); // TODO Auto-generated constructor stub

this.con = ctx;

}

protected void draw(Canvas c, MapView osmv, boolean shadow) {

//paint = new Paint(Paint.ANTI_ALIAS_FLAG);

//c.drawCircle(0, 0, 10, this.paint);

}

public boolean onDoubleTap(MotionEvent e, MapView mapView) {

int zoomLevel = mMapView.getZoomLevel();

mMapController.setZoom(zoomLevel);

IGeoPoint point = mapView.getProjection().fromPixels((int)e.getX(), (int)e.getY());

Lat = (float) (point.getLatitudeE6()/1E6);

Lon = (float) (point.getLongitudeE6()/1E6);

final ArrayList items = new ArrayList();

items.add(new OverlayItem("1", "2", new GeoPoint(point.getLatitudeE6(), point.getLongitudeE6())));

ItemizedIconOverlay MyLocationOverlay = new ItemizedIconOverlay(con, items, null);

mMapView.getOverlays().add(MyLocationOverlay);

mMapController.animateTo(point);

routeList.add(new Coord(Lat, Lon));

return true;// This stops the double tap being passed on to the mapview

}

}

public void Btn_count_Click(View v) {

if (routeList.size()>1) {

if (routeList.size()==2) {

start_lat = routeList.get(0).lat;

start_lon = routeList.get(0).lon;

finish_lat = routeList.get(1).lat;

finish_lon = routeList.get(1).lon;

url = "http://routes.cloudmade.com/"+API_key+"/api/0.3/"+start_lat+","+start_lon+","+finish_lat+","+finish_lon+"/"+move_type+".js?lang=ru&units=km";

}

if (routeList.size()>2) {

start_lat = routeList.get(0).lat;

start_lon = routeList.get(0).lon;

finish_lat = routeList.get(routeList.size()-1).lat;

finish_lon = routeList.get(routeList.size()-1).lon;

url="";

url = "http://routes.cloudmade.com/"+API_key+"/api/0.3/"+start_lat+","+start_lon+",%5B";

for (int i=1; i<routeList.size()-1;i++) {

url = url + routeList.get(1).lat+"," + routeList.get(1).lon;

if (i<routeList.size()-2) url = url+",";

}

url = url + "%5D,"+finish_lat+","+finish_lon+"/"+move_type+".js?lang=ru&units=km";

}

HttpClient httpclient = new DefaultHttpClient();

HttpPost httppost = new HttpPost(url);

try {

ResponseHandler<String> responseHandler = new BasicResponseHandler();

response = httpclient.execute(httppost, responseHandler);

response = response.replace ('"', ' ');

Pattern p = Pattern.compile(".*total_distance :(\\d+).*total_time :(\\d+).*route_geometry :\\[([\\[\\d+\\.\\d+\\,\\d+\\.\\d+\\]\\,?]+)\\].*");

Matcher m = p.matcher(response);

 

if (m.matches()) {

dist = Float.parseFloat(m.group(1));

time = Float.parseFloat(m.group(2));

route = m.group(3);

}

 

route = route.substring(1,route.length()-2);

String[] coord_pair = route.split("\\],\\[");

List <Coord> coordList = new ArrayList<Coord>();

p = Pattern.compile("(\\d+\\.\\d+)\\,(\\d+\\.\\d+)");

for (int i=0; i<coord_pair.length; i++) {

m = p.matcher(coord_pair[i]);

if (m.matches()) {

lat = Float.parseFloat(m.group(1));

lon = Float.parseFloat(m.group(2));

coordList.add(new Coord(lat, lon));

}

}

 

PathOverlay myPath = new PathOverlay(Color.GREEN, this);

myPath.addPoint(new GeoPoint((int) (start_lat * 1e6),(int) (start_lon * 1e6)));

 

for (int i=0; i<coordList.size();i++) {

myPath.addPoint(new GeoPoint((int) (coordList.get(i).lat * 1e6),(int) (coordList.get(i).lon * 1e6)));

}

myPath.addPoint(new GeoPoint((int) (finish_lat * 1e6),(int) (finish_lon * 1e6)));

mMapController.animateTo(new GeoPoint((int) (start_lat * 1e6),(int) (start_lon * 1e6)));

txt_dist.setText(""+(int)Math.floor(dist/1000)+"км "+(int)(dist%1000)+"м.");

txt_time.setText(""+(int)Math.floor(time/60)+"мин "+(int)(time%60)+"сек.");

mMapView.getOverlays().add(myPath);

 

} catch (ClientProtocolException e) { } catch (IOException e) { }

}

else{ }

}

}

Класс SettingsScreen

package app.arm.courier;

import org.osmdroid.views.MapView;

import android.app.Activity;

import android.content.Context;

…

public class SettingsScreen extends Activity {

public static final String APP_PREFERENCES = "mysettings"; // имя файла настроек

public static final String APP_PREFERENCES_SERVER = "server"; // тип String

public static final String APP_PREFERENCES_LOGIN = "login"; // тип String

public static final String APP_PREFERENCES_PASSWORD = "password"; // тип String

SharedPreferences mSettings;

EditText serverText;

EditText loginText;

EditText passwordText;

@Override

public void onCreate(Bundle savedInstanceState) {

super.onCreate(savedInstanceState);

setContentView(R.layout.settings);

mSettings = getSharedPreferences(APP_PREFERENCES, Context.MODE_PRIVATE);

serverText = (EditText)findViewById(R.id.editText1);

loginText = (EditText)findViewById(R.id.editText2);

passwordText = (EditText)findViewById(R.id.editText3);

startService(new Intent(this,GPS_Service.class));

if(mSettings.contains(APP_PREFERENCES_SERVER)) {

serverText.setText(mSettings.getString(APP_PREFERENCES_SERVER, ""));

}

if(mSettings.contains(APP_PREFERENCES_LOGIN)) {

loginText.setText(mSettings.getString(APP_PREFERENCES_LOGIN, ""));

}

if(mSettings.contains(APP_PREFERENCES_PASSWORD)) {

passwordText.setText(mSettings.getString(APP_PREFERENCES_PASSWORD, ""));

}

}

public void but_set_Click(View v) {

String strServerText = serverText.getText().toString();

String strLoginText = loginText.getText().toString();

String strPasswordText = passwordText.getText().toString();

Editor editor = mSettings.edit();

editor.putString(APP_PREFERENCES_SERVER, strServerText);

editor.putString(APP_PREFERENCES_LOGIN, strLoginText);

editor.putString(APP_PREFERENCES_PASSWORD, strPasswordText);

editor.commit();

}

}

Класс StatusScreen

package app.arm.courier;

import android.app.Activity;

import android.content.Context;

import android.content.Intent;

import android.content.SharedPreferences;

import android.content.SharedPreferences.Editor;

import android.os.Bundle;

import android.view.View;

import android.widget.ArrayAdapter;

import android.widget.EditText;

import android.widget.Spinner;

public class StatusScreen extends Activity {

public static final String APP_PREFERENCES = "mysettings"; // имя файла настроек

public static final String APP_PREFERENCES_STATUS_TEXT = "status_text"; // тип String

public static final String APP_PREFERENCES_STATUS = "status"; // тип String

public static final String APP_PREFERENCES_STATUS_ID = "status_id"; // тип String

public static final String APP_PREFERENCES_SERVER = "server"; // тип String

public static final String[] status_list = {"Свободен","Выполняю заказ","Перерыв в работе","Авария"};

SharedPreferences mSettings;

Spinner spinner;

EditText statusText;

@Override

public void onCreate(Bundle savedInstanceState) {

super.onCreate(savedInstanceState);

setContentView(R.layout.status);

mSettings = getSharedPreferences(APP_PREFERENCES, Context.MODE_PRIVATE);

statusText = (EditText)findViewById(R.id.editText1);

spinner = (Spinner) findViewById(R.id.spinner1);

startService(new Intent(this,GPS_Service.class));

ArrayAdapter<String> adapter = new ArrayAdapter<String>(

this, android.R.layout.simple_spinner_item, status_list);

adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);

spinner.setAdapter(adapter);

if(mSettings.contains(APP_PREFERENCES_STATUS_ID)) {

spinner.setSelection(Integer.parseInt(mSettings.getString(APP_PREFERENCES_STATUS_ID, "")));

}

if(mSettings.contains(APP_PREFERENCES_STATUS_TEXT)) {

statusText.setText(mSettings.getString(APP_PREFERENCES_STATUS_TEXT, ""));

}

}

public void but_set_Click(View v) {

String strStatusText = statusText.getText().toString();

String strStatus = spinner.getSelectedItem().toString();

String strStatusID = Integer.toString(spinner.getSelectedItemPosition());

Editor editor = mSettings.edit();

editor.putString(APP_PREFERENCES_STATUS_TEXT, strStatusText);

editor.putString(APP_PREFERENCES_STATUS, strStatus);

editor.putString(APP_PREFERENCES_STATUS_ID, strStatusID);

editor.commit();

}

}

Класс CourierARMActivity

package app.arm.courier;

import android.app.Activity;

import android.location.Location;

import android.os.Bundle;

import android.util.Log;

import android.view.View;

import android.widget.Button;

import android.content.BroadcastReceiver;

import android.content.Context;

import android.content.Intent;

import android.content.IntentFilter;

public class CourierARMActivity extends Activity {

/** Called when the activity is first created. */

Button But_nav;

Button But_stat;

Button But_cont;

Button But_book;

Button But_obj;

Button But_set;

Button But_ext;

BroadcastReceiver service;

@Override

public void onCreate(Bundle savedInstanceState) {

super.onCreate(savedInstanceState);

setContentView(R.layout.main);

But_nav = (Button) findViewById(R.id.but_nav);

But_stat = (Button) findViewById(R.id.but_stat);

But_cont = (Button) findViewById(R.id.but_cont);

But_obj = (Button) findViewById(R.id.but_obj);

But_set = (Button) findViewById(R.id.but_set);

But_ext = (Button) findViewById(R.id.but_ext);

IntentFilter filter = new IntentFilter();

filter.addAction("AppService");

if(service!= null) {

service = new BroadcastReceiver()

{

@Override

public void onReceive(Context context, Intent intent)

{

if(intent.getAction().equals("AppService"))

{

Log.i("AppService",intent.getStringExtra("GPS_Lat"));

Log.i("AppService",intent.getStringExtra("GPS_Lon"));

}

}

};

registerReceiver(service, filter);

//Запуск службы

startService(new Intent(this,GPS_Service.class));

}

}

public void but_nav_Click(View v) {

Intent intent = new Intent();

intent.setClass(this, NavigationScreen.class);

startActivity(intent);

if(service!= null){unregisterReceiver(service);}

stopService(new Intent(this,GPS_Service.class));

}

public void but_stat_Click(View v) {

Intent intent = new Intent();

intent.setClass(this, StatusScreen.class);

startActivity(intent);

if(service!= null){unregisterReceiver(service);}

stopService(new Intent(this,GPS_Service.class));

}

public void but_cont_Click(View v) {

Intent intent = new Intent();

intent.setClass(this, ContactsScreen.class);

startActivity(intent);

if(service!= null){unregisterReceiver(service);}

stopService(new Intent(this,GPS_Service.class));

}

public void but_obj_Click(View v) {

Intent intent = new Intent();

intent.setClass(this, ObjectsScreen.class);

startActivity(intent);

if(service!= null){unregisterReceiver(service);}

stopService(new Intent(this,GPS_Service.class));

}

public void but_set_Click(View v) {

Intent intent = new Intent();

intent.setClass(this, SettingsScreen.class);

startActivity(intent);

if(service!= null){unregisterReceiver(service);}

stopService(new Intent(this,GPS_Service.class));

}

public void but_ext_Click(View v) {

if(service!= null){unregisterReceiver(service);}

stopService(new Intent(this,GPS_Service.class));

android.os.Process.killProcess(android.os.Process.myPid());

}

@Override

protected void onDestroy()

{

super.onDestroy();

if(service!= null){unregisterReceiver(service);}

stopService(new Intent(this,GPS_Service.class));

}

}

 

Приложение Б

 

Исходний код программы.

Диспетчерская часть

 

Receiver.php

<?

/** Имя базы данных */

define('DB_NAME', LOGIN_default');

/** Имя пользователя MySQL */

define('DB_USER', LOGIN_default');

/** Пароль к базе данных MySQL */

define('DB_PASSWORD', 'PASSWORD');

/** Имя сервера MySQL */

define('DB_HOST', '127.0.0.1');

$link = mysql_connect(DB_HOST, DB_USER, DB_PASSWORD) or die ("Невозможно подключиться к MySQL");

$user = mysql_real_escape_string($_GET['user']);

$password = mysql_real_escape_string($_GET['password']);

$lat = mysql_real_escape_string($_GET['lat']);

$lon = mysql_real_escape_string($_GET['lon']);

$status = mysql_real_escape_string($_GET['status']);

$status_text = mysql_real_escape_string($_GET['status_text']);

mysql_select_db (DB_NAME);

// http://yamashkin.ru/?user=user&password=pass&lat=45.324&lon=54.634345&status="авария"&status_text="отличный день!"

$query = "SELECT * FROM USERS WHERE USER='$user' AND PASSWORD='$password'";

$aut = mysql_query ($query) or die ("Невозможно добавить");

$row = mysql_fetch_row($aut);

$id = $row[0];

if ($row[0]>=1)

{

mysql_query("SET NAMES 'utf8'");

$query = "INSERT INTO USER_STATE (ID_USER, LAT, LON, STATUS, STATUS_TEXT) VALUES ('$id','$lat','$lon','$status','$status_text')";

mysql_query ($query) or die ("Невозможно добавить");

}

else

{

}

?>

Dispatcher.php

<html>

<head>

<title>Windrose 2012 Dispatcher</title>

<link rel="stylesheet" href="/leaflet/dist/leaflet.css" />

<link rel="stylesheet" href="/style.css" />

<!--[if lte IE 8]>

<link rel="stylesheet" href="/leaflet/dist/leaflet.ie.css" />

<![endif]-->

<script src="/leaflet/dist/leaflet.js"></script>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>

<script src="/ts/jquery.tablesorter.js"></script>

</head>

<body>

<div id="map" style="height: 600px"></div>

<script>

var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/99558b6adf554346afa9ca70bf6104dc/{styleId}/256/{z}/{x}/{y}.png',

cloudmadeAttribution = 'Windrose 2012 Dispatcher',

cloudmadeOptions = {maxZoom: 18, attribution: cloudmadeAttribution};

var minimal = new L.TileLayer(cloudmadeUrl, cloudmadeOptions, {styleId: 22677}),

midnightCommander = new L.TileLayer(cloudmadeUrl, cloudmadeOptions, {styleId: 999}),

normal = new L.TileLayer(cloudmadeUrl, cloudmadeOptions, {styleId: 1})

var map = new L.Map('map', {

center: new L.LatLng(54.184841, 45.174256),

zoom: 13,

layers: [normal]

});

var baseMaps = {

"Minimal": minimal,

"Night View": midnightCommander,

"Normal": normal

};

var layersControl = new L.Control.Layers(baseMaps);

map.addControl(layersControl);

var last_marker =[0,0,0,0,0,0,0,0,0];

var marker = new Array();

var LeafIcon = L.Icon.extend({

iconUrl: '/img/leaf-green.png',

shadowUrl: '/img/leaf-shadow.png',

iconSize: new L.Point(38, 95),

shadowSize: new L.Point(68, 95),

iconAnchor: new L.Point(22, 94),

popupAnchor: new L.Point(-3, -76)

});

var greenIcon = new LeafIcon(),

redIcon = new LeafIcon('/img/leaf-red.png'),

orangeIcon = new LeafIcon('/img/leaf-orange.png');

blueIcon = new LeafIcon('/img/leaf-blue.png');

function show()

{

$.ajax({

url: "get_user.php",

cache: false,

dataType: 'json',

success: function(response){

table_content = "<table id=\"user_table\"><thead><tr><th class=\"th_name\">Имя</th><th class=\"th_phone\">Контактный телефон</th><th class=\"th_s\">Статус</th><th class=\"th_sm\">Статусное сообщение</th><th class=\"th_tm\">Время</th></tr></thead><tbody>";

for (i=0;i<response.length;i++)

{

if (response[i] != false) {

markerLocation = new L.LatLng(parseFloat(response[i][2]), parseFloat(response[i][3]));

if (last_marker[i] == 0) {

if (response[i][4] == "Свободен") marker[i] = new L.Marker(markerLocation, {icon: greenIcon});

if (response[i][4] == "Выполняю заказ") marker[i] = new L.Marker(markerLocation, {icon: blueIcon});

if (response[i][4] == "Перерыв в работе") marker[i] = new L.Marker(markerLocation, {icon: orangeIcon});

if (response[i][4] == "Авария") marker[i] = new L.Marker(markerLocation, {icon: redIcon});

map.addLayer(marker[i]);

}

if (last_marker[i] == 1) {

marker[i].setLatLng(markerLocation);

}

last_marker[i] = 1;

marker[i].bindPopup("<b>"+response[i][0]+"</b><br />"+response[i][5]);

table_content += "<tr><td>"+response[i][0]+"</td><td>"+response[i][1]+"</td><td>"+response[i][4]+"</td><td>"+response[i][5]+"</td><td>"+response[i][6]+"</td></tr>";

}

else

{

last_marker[i] = 0;

}

}

table_content += "</tbody></table>";

document.getElementById("test").innerHTML=table_content;

}

});

}

$(document).ready(function(){

show();

setInterval('show()',1000);

});

</script>

<div id="test"></div>

</body>

</html>

Get_user.php

<?

function json_encode_x ($in) {

return html_entity_decode(

preg_replace(

'/\\\&#x([0-9a-fA-F]{3});/',

'\\\\\u0$1',

preg_replace(

'/\\\u0([0-9a-fA-F]{3})/',

'&#x$1;',

json_encode($in)

)

),

ENT_NOQUOTES,

'utf-8'

);

}

/** Имя базы данных */

define('DB_NAME', LOGIN_default');

/** Имя пользователя MySQL */

define('DB_USER', LOGIN_default');

/** Пароль к базе данных MySQL */

define('DB_PASSWORD', PASSWORD);

/** Имя сервера MySQL */

define('DB_HOST', '127.0.0.1');

$link = mysql_connect(DB_HOST, DB_USER, DB_PASSWORD) or die ("Невозможно подключиться к MySQL");

mysql_select_db (DB_NAME);

mysql_query ("set names utf8");

$query = "SELECT * FROM USERS";

$result = mysql_query ($query) or die ("Ошибка");

$id_array = array();

while ($row = mysql_fetch_row($result))

{

array_push ($id_array,$row[0]);

}

$locate_array = array();

foreach ($id_array as $key => $value) {

$query = "SELECT USERS.NAME, USERS.PHONE, USER_STATE.LAT, USER_STATE.LON, USER_STATE.STATUS, USER_STATE.STATUS_TEXT, USER_STATE.TIME FROM USERS,USER_STATE WHERE USERS.ID_USER=USER_STATE.ID_USER AND USERS.ID_USER = '$value' ORDER BY USER_STATE.TIME DESC LIMIT 1";

$result = mysql_query ($query) or die ("Ошибка");

$row = mysql_fetch_row($result);

array_push ($locate_array,$row);

}

echo json_encode_x($locate_array);

?>
