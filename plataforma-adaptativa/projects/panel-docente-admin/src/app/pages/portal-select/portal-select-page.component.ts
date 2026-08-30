import { Component } from '@angular/core';
import { PortalSelectComponent } from 'core-shared';

@Component({
  selector: 'app-portal-select-page',
  imports: [PortalSelectComponent],
  template: `
    <lib-portal-select
      currentPortalType="teacher-admin"
      siblingPortalUrl="http://localhost:4201"
    />
  `,
})
export class PortalSelectPageComponent {}
