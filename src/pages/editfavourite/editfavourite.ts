import { Component } from '@angular/core';
import { AlertController, IonicPage, ToastController } from 'ionic-angular';

/**
 * Generated class for the EditfavouritePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
	segment: 'edit'
})
@Component({
	selector: 'page-editfavourite',
	templateUrl: 'editfavourite.html',
})
export class EditfavouritePage {
	favouriteList: Array<Object> = [];
	constructor(private alertCtrl: AlertController, private toastCtrl: ToastController ) {
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad EditfavouritePage');
		this.populateFavouriteList();
	}

	editFavourite(name) {
		const address = JSON.parse(localStorage.getItem(name)).address;
		if (name === undefined) {
			const toast = this.toastCtrl.create({
				message: 'Oops.. There was some error, try again later.',
				duration: 3000,
				position: 'top'
			});
			toast.present();
		} else {
			const alert = this.alertCtrl.create({
				title: 'Edit your favourite',
				subTitle: address,
				inputs: [
				{
					name: 'nick_name',
					type: 'text',
					value: name
				}
				],
				buttons: [
					{
						text: 'Delete',
						handler: data => {
							if (localStorage.getItem(data.nick_name)) {
								localStorage.removeItem(data.nick_name);
								const toast = this.toastCtrl.create({
									message: 'Deleted successfully.',
									duration: 3000,
									position: 'top'
								});
								toast.present();
								this.populateFavouriteList();
								return true;
							} else {
								const toast = this.toastCtrl.create({
									message: 'Cannot delete ' + data.nick_name,
									duration: 3000,
									position: 'top'
								});
								toast.present();
								return false;
							}
						}
					},
					{
						text: 'Save',
						handler: data => {
							if (localStorage.getItem(data.nick_name) === undefined) {
								localStorage.setItem(data.nick_name, localStorage.getItem(name));
								localStorage.removeItem(name);
								const toast = this.toastCtrl.create({
									message: 'Updated successfully.',
									duration: 3000,
									position: 'top'
									});
								toast.present();
								this.populateFavouriteList();
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
			alert.present();
		}
	}

	populateFavouriteList() {
		this.favouriteList = [];
		for (let i = 0; i < localStorage.length; i++) {
			if (localStorage.key(i).indexOf('ionic') === -1) {
				this.favouriteList.push({'name': localStorage.key(i), 'data': JSON.parse(localStorage.getItem(localStorage.key(i)))});
			}
		}
		if (this.favouriteList.length === 0) {
			this.favouriteList.push({'name': 'Your favourite area is empty :('});
		}
	}
}
