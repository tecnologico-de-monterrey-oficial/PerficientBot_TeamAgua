import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { HomeComponent } from './home.component';
import { SmartbotComponent } from "./smartbot/smartbot.component";

@NgModule({
    declarations: [
        HomeComponent,
        SmartbotComponent
    ],
    exports: [
        HomeComponent,
    ],
    imports: [
        CommonModule
    ]
})

export class HomeModule { }