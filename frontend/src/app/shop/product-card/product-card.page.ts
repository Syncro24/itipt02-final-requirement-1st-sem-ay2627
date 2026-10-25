import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.page.html',
  styleUrls: ['./product-card.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonIcon, IonButton, CommonModule, FormsModule]
})
export class ProductCardPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
