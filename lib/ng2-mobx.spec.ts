import { By } from "@angular/platform-browser";
import { DebugElement, Component, ChangeDetectionStrategy } from "@angular/core";
import { TestBed, async, fakeAsync, tick } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";

import { observable, computed } from "mobx";
import { MobxAutorunDirective, MobxAutorunSyncDirective } from "./ng2-mobx";

// import {
//   expect, it, iit, xit,
//   describe, ddescribe, xdescribe,
//   before, beforeEach, beforeEachProviders, withProviders,
//   async, inject,
//   testing
// } from "@angular/core/testing";

// Adapted from the official angular2 docs, https://angular.io/docs/ts/latest/guide/testing.html

let fullNameCalculations;

class TestStore {
  @observable firstName = "James";
  @observable lastName = "Bond";

  @computed get fullName() {
    fullNameCalculations++;
    return `${this.firstName} ${this.lastName}`;
  }
}

@Component({
  template: `
    <div *mobxAutorun>
      <span id="fullname">{{store.fullName}}</span>
    </div>
    <button (click)="setLastName()">Set Name</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  private store = new TestStore();
  constructor() {
    fullNameCalculations = 0;
  }
  setLastName() {
    this.store.lastName = 'Dean';
  }
}

@Component({
  template: `
    <div *mobxAutorunSync>
      <span id="fullname">{{store.fullName}}</span>
    </div>
    <button (click)="setLastName()">Set Name</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponentSync {
  private store = new TestStore();
  constructor() {
    fullNameCalculations = 0;
  }
  setLastName() {
    this.store.lastName = 'Dean';
  }
}

let fullname, button, component;

describe('ng2Mobx', () => {
  TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  describe('mobxAutorun', () => {
    beforeEach((done) => {
      component = TestBed
        .configureTestingModule({ declarations: [ MobxAutorunDirective, TestComponent ] })
        .createComponent(TestComponent);

      component.detectChanges(); // initial binding

      fullname = component.debugElement.query(By.css("#fullname"));
      button = component.debugElement.query(By.css("button"));
      setTimeout(done);
    });

    // color tests
    it("should have correct content", () => {
      expect(fullname.nativeElement.innerText).toEqual("James Bond");
      expect(fullNameCalculations).toEqual(1);
    });

    it("should recompute value once", (done) => {
      button.triggerEventHandler("click", null);
      setTimeout(() => {
        expect(fullname.nativeElement.innerText).toEqual("James Dean");
        expect(fullNameCalculations).toEqual(2);
        done();
      });
    });
  });

  describe('mobxAutorunSync', () => {
    beforeEach(() => {
      component = TestBed
        .configureTestingModule({ declarations: [ MobxAutorunSyncDirective, TestComponentSync ] })
        .createComponent(TestComponentSync);

      component.detectChanges(); // initial binding

      fullname = component.debugElement.query(By.css("#fullname"));
      button = component.debugElement.query(By.css("button"));
    });

    // color tests
    it("should have correct content", () => {
      expect(fullname.nativeElement.innerText).toEqual("James Bond");
      expect(fullNameCalculations).toEqual(1);
    });

    it("should recompute value once", () => {
      button.triggerEventHandler("click", null);
      expect(fullname.nativeElement.innerText).toEqual("James Dean");
      expect(fullNameCalculations).toEqual(2);
    });
  });
});
