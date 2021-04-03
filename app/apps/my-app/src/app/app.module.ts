import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FwCoreModule } from '@fw/core';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FwCoreModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
