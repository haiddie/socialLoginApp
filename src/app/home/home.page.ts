import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';



import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as auth from 'firebase/auth';


import { GooglePlus } from '@ionic-native/google-plus/ngx';

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  public user: any;

  userData: any = {
    name:'',
    email:''
  };

  @ViewChild('map', { static: false }) mapElement: ElementRef;
  map: any;
  address: string;

  latitude: number;
  longitude: number;

  constructor(private fb: Facebook, private googlePlus: GooglePlus,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private fireAuth: AngularFireAuth) {}


    ngOnInit() {
      this.loadMap();
    }


    async login() {

      this.fb.login(['email'])
        .then((response: FacebookLoginResponse) => {
          console.log('response : ',response)
          this.onLoginSuccess(response);
          console.log(response.authResponse.accessToken);
        }).catch((error) => {
          console.log(error);
         // alert('error:' + error);
        });
    }
  
    onLoginSuccess(res: FacebookLoginResponse) {
      // const { token, secret } = res;
      const credential = auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
      this.fireAuth.signInWithCredential(credential)
        .then((response) => {
       console.log('from firebase',response)
        });
  
    }


    googleSignIn() {
      this.googlePlus.login({})
        .then((result:any)=>{
          console.log('result',result);
          this.userData.name = result?.displayName;
          this.userData.email= result.email;
        }  )
        .catch((err:any) =>{
          console.log('err',err);
          this.userData = `Error ${JSON.stringify(err)}`
        } )
    }


    loadMap() {
      this.geolocation.getCurrentPosition().then((resp) => {
  
        this.latitude = resp.coords.latitude;
        this.longitude = resp.coords.longitude;
  
        let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
        let mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
  
        this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
  
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  
        this.map.addListener('dragend', () => {
  
          this.latitude = this.map.center.lat();
          this.longitude = this.map.center.lng();
  
          this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
        });
  
      }).catch((error) => {
        console.log('Error getting location', error);
      });
    }
  
    getAddressFromCoords(lattitude, longitude) {
      console.log("getAddressFromCoords " + lattitude + " " + longitude);
      let options: NativeGeocoderOptions = {
        useLocale: true,
        maxResults: 5
      };
  
      this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
        .then((result: NativeGeocoderResult[]) => {
          this.address = "";
          let responseAddress = [];
          for (let [key, value] of Object.entries(result[0])) {
            if (value.length > 0)
              responseAddress.push(value);
  
          }
          responseAddress.reverse();
          for (let value of responseAddress) {
            this.address += value + ", ";
          }
          this.address = this.address.slice(0, -2);
        })
        .catch((error: any) => {
          this.address = "Address Not Available!";
        });
  
    }

}
