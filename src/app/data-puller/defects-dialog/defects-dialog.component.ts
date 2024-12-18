// import { Component, Inject } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// @Component({
//   selector: 'app-defects-dialog',
//   templateUrl: './defects-dialog.component.html',
//   styleUrls: ['./defects-dialog.component.scss']
// })
// export class DefectsDialogComponent {
//   constructor(
//     public dialogRef: MatDialogRef<DefectsDialogComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: { defectsCount: number; defects: { description: string }[], links: { url: string }[] }
//   ) {
//     if (!data.defects) {
//       data.defects = [];
//     }
//     if (!data.links) {
//       data.links = [];
//     }
//   }

//   onNoClick(): void {
//     this.dialogRef.close();
//   }

//   addDefect(): void {
//     this.data.defects.push({ description: '' });
//     this.data.defectsCount = this.data.defects.length;
//   }

//   addLink(): void {
//     this.data.links.push({ url: '' });
//   }
// }



import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-defects-dialog',
  templateUrl: './defects-dialog.component.html',
  styleUrls: ['./defects-dialog.component.scss']
})
export class DefectsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DefectsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { defectsCount: number; defects: { description: string }[], links: { url: string }[] }
  ) {
    if (!data.defects) {
      data.defects = [];
    }
    if (!data.links) {
      data.links = [];
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  addDefect(): void {
    this.data.defects.push({ description: '' });
    this.data.defectsCount = this.data.defects.length;
  }

  removeDefect(index: number): void {
    this.data.defects.splice(index, 1);
    this.data.defectsCount = this.data.defects.length;
  }

  addLink(): void {
    this.data.links.push({ url: '' });
  }

  removeLink(index: number): void {
    this.data.links.splice(index, 1);
  }
}
