import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { flashOutline, hardwareChipOutline} from 'ionicons/icons';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButton, IonIcon, CommonModule, FormsModule]
})
export class HomePage implements OnInit {

  constructor() {
    addIcons({
      flashOutline,
      hardwareChipOutline
    })
  }

  ngOnInit() {
  }

}
