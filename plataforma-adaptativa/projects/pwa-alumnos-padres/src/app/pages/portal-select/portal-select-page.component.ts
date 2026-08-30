import { Component } from '@angular/core';
import { PortalSelectComponent } from 'core-shared';

@Component({
  selector: 'app-portal-select-page',
  imports: [PortalSelectComponent],
  template: `
    <lib-portal-select
      currentPortalType="student-parent"
      siblingPortalUrl="http://localhost:4200"
    />
  `,
})
export class PortalSelectPageComponent {}
