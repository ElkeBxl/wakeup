import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
declare let google: any;
/**
 * Generated class for the MapPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
	segment: 'map'
})
@Component({
	selector: 'page-map',
	templateUrl: 'map.html',
})
export class MapPage {
	destination: string;
	radius: number = 500;
	fence: any;
	geoCoder: any;
	map: any;
	autocomplete: any;
	currentLocationMarker: any;
	watchId: any;
	startWatch: boolean =  false;
	entered: boolean = false;

	constructor(private navCtrl: NavController,
		private navParams: NavParams,
		private toastCtrl: ToastController,
		private alertCtrl: AlertController) {
		this.geoCoder = new google.maps.Geocoder();
		this.currentLocationMarker = new google.maps.Marker({
			position: null,
			map: null,
			icon: '../../assets/icon/user_location.png'
		});

	}

	startOrStopWatching() {
		if (this.startWatch) {
			this.stopWatching();
		} else {
			this.findUserLocation();
		}
	}

	stopWatching() {
		this.startWatch = false;
		this.watchId = navigator.geolocation.clearWatch(this.watchId);
		this.currentLocationMarker.setPosition(null);
		this.map.setCenter(this.navParams.get('pin'));
	}

	setSearchBarData(pin) {
		const self = this;
		if (pin) {
			this.doGeocode(pin).then((data) => { self.destination = data; });
		}
	}

	addToFavourites() {
		console.log('Adding to favourites..');
		const alarmModel = this.alertCtrl.create({
			title: 'Favourite this location',
			inputs: [
				{
					name: 'nick_name',
					placeholder: 'Home',
					type: 'text',
					value: 'Home'
				}
			],
			buttons: [
				{
					text: 'Save',
					handler: data => {
						console.log(data.nick_name);
						if (localStorage.getItem(data.nick_name) === undefined) {
							localStorage.setItem(data.nick_name, JSON.stringify({'pin': this.navParams.get('pin'), 'address': this.destination}));
							const toast = this.toastCtrl.create({
								message: 'Added successfully.',
								duration: 3000,
								position: 'top'
							});
							toast.present();
						} else {
							const toast = this.toastCtrl.create({
								message: 'This name is already taken. Choose another to add to favourites.',
								duration: 3000,
								position: 'top'
							});
							toast.present();
							return false;
						}
					}
				}
			]
		});
		alarmModel.present();
	}

	findUserLocation() {
		this.startWatch = true;
		this.entered = false;
		if (this.watchId === undefined) {
			if (!!navigator.geolocation) {
				const self = this;
				this.watchId = navigator.geolocation.watchPosition(function(position) {
					self.showCurrentUserLocation(position);
					}, function(error) {
						console.log('error in watch position');
					}, { enableHighAccuracy: true, maximumAge: 100, timeout: 60000 }
				);
			} else {
				console.log('GPS not supported');
			}
		}
	}

	startVibration() {
		const pattern = [];
		for (let i = 0; i < 20; i++) {
			pattern.push(2000);
			pattern.push(100);
		}
		navigator.vibrate(pattern);
	}

	stopVibration() {
		navigator.vibrate(0);
		this.stopWatching();
	}

	showCurrentUserLocation(position) {
		const geolocation: any = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		this.map.setCenter(geolocation);
		console.log('Watching position...');
		console.log(geolocation);
		this.currentLocationMarker.setMap(this.map);
		this.currentLocationMarker.setPosition(geolocation);
		if ((this.entered === false)
			&& (google.maps.geometry.spherical.computeDistanceBetween(geolocation, this.fence.getCenter()) <= this.fence.getRadius())) {
			this.entered = true;
			this.startVibration();
			const alarmModel = this.alertCtrl.create({
				title: 'Wakeup Alarm',
				enableBackdropDismiss: false,
				message: 'You are about to reach your location. ',
				buttons: [
					{
					text: 'Dismiss Alarm',
					handler: data => {
						this.stopVibration();
					}
					}
				]
			});
			alarmModel.present();
		} else {
			console.log('Outside');
		}
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad MapPage');
		const pin = this.navParams.get('pin');
		console.log(pin);
		if (pin !== undefined) {
			this.setSearchBarData(pin);
			this.showMap(pin);
		} else {
			this.navCtrl.setRoot('HomePage');
		}
	}

	doGeocode(pin) {
		return new Promise<string>((resolve, reject) => {
			this.geoCoder.geocode({'location': pin}, function(results, status) {
				if (status === 'OK') {
					resolve(results[0].formatted_address);
				} else {
					reject('Error');
				}
			});
		});
	}

	suggest(event_obj) {
		let selectedPin = null;
		this.autocomplete = new google.maps.places.Autocomplete(event_obj.target, {});
		google.maps.event.addListener(this.autocomplete, 'place_changed', () => {
			const place = this.autocomplete.getPlace();
			if (place.geometry) {
				const latitude = place.geometry.location.lat();
				const longitude = place.geometry.location.lng();
				selectedPin = new google.maps.LatLng(latitude, longitude);
				this.showMap(selectedPin);
			}
		});
		if ((event_obj.keyCode === 13) && (selectedPin == null)) {
			// TODO: TOAST CONTROLLER
			console.log('Oops.. Couldn\'t find that location. Try another landmark !');
		}
	}

	createFence(map) {
		this.fence = new google.maps.Circle({
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#FF0000',
			fillOpacity: 0.35,
			map: map,
			center: map.center,
			radius: this.radius * 1,
			clickable: false
		});
	}

	showMap(pin) {
		const self = this;
		const options = {
			center: pin,
			zoom: 15,
			streetViewControl: false
		};
		this.map = new google.maps.Map(document.getElementById('map'), options);
		const marker = new google.maps.Marker({
			position: pin,
			map: this.map,
			draggable: true,
			clickable: true,
			icon: '../../assets/icon/locate.png'
		});
		marker.addListener('mouseup', function() {
			self.destination = marker.getPlace();
			self.map.setCenter(marker.getPosition());
			self.fence.setMap(null);
			self.createFence(self.map);
			self.stopWatching();
			self.startWatch = false;
			self.setSearchBarData(marker.getPosition());
		});

		const alarmModel = this.alertCtrl.create({
			title: 'Create an alarm',
			enableBackdropDismiss: true,
			message: 'Enter radius (mts) to activate',
			inputs: [
				{
				name: 'radius',
				placeholder: '500',
				type: 'number',
				value: '500'
				}
			],
			buttons: [
				{
				text: 'Save',
				handler: data => {
					this.radius = data.radius;
				}
				}
			]
		});
		alarmModel.onWillDismiss(() => {
		this.createFence(this.map);
		});

		this.map.setCenter(pin);
		alarmModel.present();
	}
}
