import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { hardwareChipOutline,removeOutline,addOutline,cartOutline } from 'ionicons/icons';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonList, IonItem, IonLabel, IonIcon, CommonModule, FormsModule]
})
export class CartPage implements OnInit {

  constructor() {
    addIcons({
      cartOutline,
      hardwareChipOutline,addOutline,removeOutline
    })
  }

  ngOnInit() {
  }

}
