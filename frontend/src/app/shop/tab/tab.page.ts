import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonAlert, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonLabel, IonTab, IonTabBar, IonTabButton, IonTabs, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from "ionicons";
import {homeOutline,cartOutline,searchOutline,personOutline} from 'ionicons/icons';
@Component({
  selector: 'app-tab',
  templateUrl: './tab.page.html',
  styleUrls: ['./tab.page.scss'],
  imports: [CommonModule,
    FormsModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel]
})
export class TabPage implements OnInit {

  constructor() {
    addIcons({
      homeOutline,
      cartOutline,
      personOutline,searchOutline
    })
  }

  ngOnInit() {
  }

}
