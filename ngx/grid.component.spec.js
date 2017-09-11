import {
  getTestBed,
  TestBed,
  async,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { CommonModule, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ngxAtlUiModule } from './ngx-atlantis-ui-module.js';

var assert = require('assert');

var types = [
  {
    type: "date",
    alignment: "right",
    pipes: [DatePipe],
    optionsPipe: ['shortDate'],
    transformation: function(val) {
      if (moment(val).isValid()) {
        return moment(val).toString();
      } else {
        return "invalid value";
      }
    }
  },
  {
    type: 'number',
    transformation: function(val) {
      if (!isNaN(val)) {
        return val;
      } else {
        return "invalid value";
      }
    }
  },
  {
    type: 'boolean',
    transformation: function(val) {
      if (typeof val === void 0 || val === null) {
        return val;
      }
      if (!val || val == '0' || val == 'false') {
        return 0;
      }
      return 1;
    }
  },
];

class gridTestComponent {
  static get annotations() {
    return [
      new Component({
        template: `
        <grid class="table table-bordered" [columns]= "columns" [rows]= "rows" (selectedRows)="selectionTest($event)" [selected]="selection" (sort)="onSort($event)">

        </grid>`
      })
    ];
  }
  constructor() {

    this.columns = [
      {
        label: "test",
        alignment: "center",
        notSortable: true
      },
      {
        label: "testNumber",
        width: "150px",
        type: "number"
      },
      {
        label: "testText"
      },
      {
        label: "testDate",
        type: 'date'
      },
      {
        label: "testBoolean",
        type: 'boolean'
      }
    ];

    this.originalRows = [
      {
        test: "1",
        testNumber: 2,
        testText: "1",
        testDate: new Date(),
        testBoolean: 0
      },
      {
        test: "2",
        testNumber: 6,
        testText: "5",
        testDate: new Date(0),
        testBoolean: 1
      },
      {
        test: "3",
        testNumber: 5,
        testText: '4',
        testDate: new Date(),
        testBoolean: 1
      },
      {
        test: "4",
        testNumber: 42,
        testText: "8",
        testDate: new Date('05/09/2005'),
        testBoolean: 1
      },
      {
        test: "5",
        testNumber: 27,
        testText: "4",
        testDate: new Date(),
        testBoolean: 0
      },
      {
        test: "6",
        testNumber: 3,
        testText: "7",
        testDate: new Date('07/03/2015'),
        testBoolean: 0
      },
      {
        test: "7",
        testNumber: 27,
        testText: "9",
        testDate: new Date('05/09/2005'),
        testBoolean: 0
      },
      {
        test: "8",
        testNumber: 152,
        testText: '32',
        testDate: new Date(),
        testBoolean: 1
      }
    ];

    this.rows = [...this.originalRows];

    this.selection = [];

  }

  selectionTest(row) {
    this.selection = row;
  }

  onSort(sorting) {
    if (!sorting.length) {
      return this.rows = [...this.originalRows];
    }
    this.loading = true;
    var columnToSort = sorting[sorting.length - 1];
    var sortingFunc = function() {};
    switch (columnToSort.type) {
      case 'text':
        sortingFunc = function(a, b) {
          return a[columnToSort.label].localeCompare(b[columnToSort.label]) * (columnToSort.order === 'desc' ? -1 : 1);
        };
        break;
      case 'boolean':
      case 'number':
        sortingFunc = function(a, b) {
          var comparison = a[columnToSort.label] > b[columnToSort.label];
          return columnToSort.order === 'desc' ? !comparison : comparison;
        };
        break;
      case 'date':
        sortingFunc = function(a, b) {
          var comparison = moment(a[columnToSort.label]).isAfter(moment(b[columnToSort.label]));
          return columnToSort.order === 'desc' ? !comparison : comparison;
        };
        break;
    }
    this.rows = this.rows.sort(sortingFunc);
    this.loading = false;
  }
}

describe('grid', function() {
  var gridComponent;

  beforeEach(async(function() {
    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, ngxAtlUiModule.forRoot(types)],
      declarations: [gridTestComponent],
      providers: [DatePipe, UpperCasePipe]
    });
    TestBed.compileComponents();
  }));

  afterEach(function() {
    getTestBed().resetTestingModule();
  });

  it('should render default value and available options', fakeAsync(() => {
    var fixture = TestBed.createComponent(gridTestComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    gridComponent = fixture.componentInstance;
    var columns = document.querySelectorAll('.gridHead');
    var rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    assert.strictEqual(columns.length, 5);

    columns.forEach((column, index) => {
      assert.strictEqual(column.querySelector('span').innerText, gridComponent.columns[index].label);
    });

    rows.forEach((row, indexRow) => {
      var cells = row.querySelectorAll('.gridCell');
      cells.forEach((cell, indexCell) => {
        if (gridComponent.columns[indexCell].type === 'date') {
          var correctDate = cell.querySelector('grid-cell').innerText;
          correctDate = correctDate.split("/");
          correctDate = correctDate[1] + "/" + correctDate[0] + "/" + correctDate[2];
          assert.strictEqual(new Date(correctDate).toDateString(), new Date(gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]).toDateString());
          return;
        }
        assert.equal(cell.querySelector('grid-cell').innerText, gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]);
      });
    });

  }));

  it('should render selected value when click on row', fakeAsync(() => {
    var fixture = TestBed.createComponent(gridTestComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    var testComponent = fixture.componentInstance;
    var rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    rows[0].click();
    tick();
    fixture.detectChanges();

    var selection = testComponent.selection;

    assert.strictEqual(selection.length, 1);
    assert.strictEqual(selection[0], testComponent.rows[0]);
  }));

  it('should render selected value, multiple selection with ctrl key', fakeAsync(() => {
    var fixture = TestBed.createComponent(gridTestComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    var testComponent = fixture.componentInstance;
    var rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    var click = new Event("click", {'bubbles': true});
    click.ctrlKey = true;

    rows[0].dispatchEvent(click);
    tick();
    fixture.detectChanges();

    rows[1].dispatchEvent(click);
    tick();
    fixture.detectChanges();

    var selection = testComponent.selection;

    assert.strictEqual(selection.length, 2);
    assert.strictEqual(selection[0], testComponent.rows[0]);
    assert.strictEqual(selection[1], testComponent.rows[1]);
  }));

  it('should render selected value, toggle selection with ctrl key', fakeAsync(() => {
    var fixture = TestBed.createComponent(gridTestComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    var testComponent = fixture.componentInstance;
    var rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    var click = new Event("click", {'bubbles': true});
    click.ctrlKey = true;

    rows[0].dispatchEvent(click);
    tick();
    fixture.detectChanges();

    rows[1].dispatchEvent(click);
    tick();
    fixture.detectChanges();

    rows[0].dispatchEvent(click);
    tick();
    fixture.detectChanges();

    var selection = testComponent.selection;

    assert.strictEqual(selection.length, 1);
    assert.strictEqual(selection[0], testComponent.rows[1]);

  }));

  it('should render selected value, multiple selection with shift key', fakeAsync(() => {
    var fixture = TestBed.createComponent(gridTestComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    var testComponent = fixture.componentInstance;
    var rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    rows[0].click();
    tick();
    fixture.detectChanges();

    var selection = testComponent.selection;

    assert.strictEqual(selection.length, 1);
    assert.strictEqual(selection[0], testComponent.rows[0]);

    var click = new Event("click", {'bubbles': true});
    click.shiftKey = true;

    rows[2].dispatchEvent(click);
    tick();
    fixture.detectChanges();

    selection = testComponent.selection;

    assert.strictEqual(selection.length, 3);
    assert.strictEqual(selection[0], testComponent.rows[0]);
    assert.strictEqual(selection[1], testComponent.rows[1]);
    assert.strictEqual(selection[2], testComponent.rows[2]);
  }));

  it('should render sorted value, click on type number', fakeAsync(() => {
    var fixture = TestBed.createComponent(gridTestComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    gridComponent = fixture.componentInstance;
    var columns = document.querySelectorAll('.gridHead');
    var rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    assert.strictEqual(columns.length, 5);

    columns.forEach((column, index) => {
      assert.strictEqual(column.querySelector('span').innerText, gridComponent.columns[index].label);
    });

    columns[1].click();
    tick();
    fixture.detectChanges();

    rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    rows.forEach((row, indexRow) => {
      var cells = row.querySelectorAll('.gridCell');
      cells.forEach((cell, indexCell) => {
        if (gridComponent.columns[indexCell].type === 'date') {
          var correctDate = cell.querySelector('grid-cell').innerText;
          correctDate = correctDate.split("/");
          correctDate = correctDate[1] + "/" + correctDate[0] + "/" + correctDate[2];
          assert.strictEqual(new Date(correctDate).toDateString(), new Date(gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]).toDateString());
          return;
        }
        assert.equal(cell.querySelector('grid-cell').innerText, gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]);
      });
    });

    columns[1].click();
    tick();
    fixture.detectChanges();

    rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    rows.forEach((row, indexRow) => {
      var cells = row.querySelectorAll('.gridCell');
      cells.forEach((cell, indexCell) => {
        if (gridComponent.columns[indexCell].type === 'date') {
          var correctDate = cell.querySelector('grid-cell').innerText;
          correctDate = correctDate.split("/");
          correctDate = correctDate[1] + "/" + correctDate[0] + "/" + correctDate[2];
          assert.strictEqual(new Date(correctDate).toDateString(), new Date(gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]).toDateString());
          return;
        }
        assert.equal(cell.querySelector('grid-cell').innerText, gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]);
      });
    });
  }));

  it('should render sorted value, click on type text', fakeAsync(() => {
    var fixture = TestBed.createComponent(gridTestComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    gridComponent = fixture.componentInstance;
    var columns = document.querySelectorAll('.gridHead');
    var rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    assert.strictEqual(columns.length, 5);

    columns.forEach((column, index) => {
      assert.strictEqual(column.querySelector('span').innerText, gridComponent.columns[index].label);
    });

    columns[1].click();
    tick();
    fixture.detectChanges();

    rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    rows.forEach((row, indexRow) => {
      var cells = row.querySelectorAll('.gridCell');
      cells.forEach((cell, indexCell) => {
        if (gridComponent.columns[indexCell].type === 'date') {
          var correctDate = cell.querySelector('grid-cell').innerText;
          correctDate = correctDate.split("/");
          correctDate = correctDate[1] + "/" + correctDate[0] + "/" + correctDate[2];
          assert.strictEqual(new Date(correctDate).toDateString(), new Date(gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]).toDateString());
          return;
        }
        assert.equal(cell.querySelector('grid-cell').innerText, gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]);
      });
    });

    columns[1].click();
    tick();
    fixture.detectChanges();

    rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    rows.forEach((row, indexRow) => {
      var cells = row.querySelectorAll('.gridCell');
      cells.forEach((cell, indexCell) => {
        if (gridComponent.columns[indexCell].type === 'date') {
          var correctDate = cell.querySelector('grid-cell').innerText;
          correctDate = correctDate.split("/");
          correctDate = correctDate[1] + "/" + correctDate[0] + "/" + correctDate[2];
          assert.strictEqual(new Date(correctDate).toDateString(), new Date(gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]).toDateString());
          return;
        }
        assert.equal(cell.querySelector('grid-cell').innerText, gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]);
      });
    });
  }));

  it('should render sorted value, click on type date', fakeAsync(() => {
    var fixture = TestBed.createComponent(gridTestComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    gridComponent = fixture.componentInstance;
    var columns = document.querySelectorAll('.gridHead');
    var rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    assert.strictEqual(columns.length, 5);

    columns.forEach((column, index) => {
      assert.strictEqual(column.querySelector('span').innerText, gridComponent.columns[index].label);
    });

    columns[1].click();
    tick();
    fixture.detectChanges();

    rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    rows.forEach((row, indexRow) => {
      var cells = row.querySelectorAll('.gridCell');
      cells.forEach((cell, indexCell) => {
        if (gridComponent.columns[indexCell].type === 'date') {
          var correctDate = cell.querySelector('grid-cell').innerText;
          correctDate = correctDate.split("/");
          correctDate = correctDate[1] + "/" + correctDate[0] + "/" + correctDate[2];
          assert.strictEqual(new Date(correctDate).toDateString(), new Date(gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]).toDateString());
          return;
        }
        assert.equal(cell.querySelector('grid-cell').innerText, gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]);
      });
    });

    columns[1].click();
    tick();
    fixture.detectChanges();

    rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    rows.forEach((row, indexRow) => {
      var cells = row.querySelectorAll('.gridCell');
      cells.forEach((cell, indexCell) => {
        if (gridComponent.columns[indexCell].type === 'date') {
          var correctDate = cell.querySelector('grid-cell').innerText;
          correctDate = correctDate.split("/");
          correctDate = correctDate[1] + "/" + correctDate[0] + "/" + correctDate[2];
          assert.strictEqual(new Date(correctDate).toDateString(), new Date(gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]).toDateString());
          return;
        }
        assert.equal(cell.querySelector('grid-cell').innerText, gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]);
      });
    });
  }));

  it('should render sorted value, click on type boolean', fakeAsync(() => {
    var fixture = TestBed.createComponent(gridTestComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    gridComponent = fixture.componentInstance;
    var columns = document.querySelectorAll('.gridHead');
    var rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    assert.strictEqual(columns.length, 5);

    columns.forEach((column, index) => {
      assert.strictEqual(column.querySelector('span').innerText, gridComponent.columns[index].label);
    });

    columns[1].click();
    tick();
    fixture.detectChanges();

    rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    rows.forEach((row, indexRow) => {
      var cells = row.querySelectorAll('.gridCell');
      cells.forEach((cell, indexCell) => {
        if (gridComponent.columns[indexCell].type === 'date') {
          var correctDate = cell.querySelector('grid-cell').innerText;
          correctDate = correctDate.split("/");
          correctDate = correctDate[1] + "/" + correctDate[0] + "/" + correctDate[2];
          assert.strictEqual(new Date(correctDate).toDateString(), new Date(gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]).toDateString());
          return;
        }
        assert.equal(cell.querySelector('grid-cell').innerText, gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]);
      });
    });

    columns[1].click();
    tick();
    fixture.detectChanges();

    rows = document.querySelector('grid-body').querySelectorAll('.gridRow');

    rows.forEach((row, indexRow) => {
      var cells = row.querySelectorAll('.gridCell');
      cells.forEach((cell, indexCell) => {
        if (gridComponent.columns[indexCell].type === 'date') {
          var correctDate = cell.querySelector('grid-cell').innerText;
          correctDate = correctDate.split("/");
          correctDate = correctDate[1] + "/" + correctDate[0] + "/" + correctDate[2];
          assert.strictEqual(new Date(correctDate).toDateString(), new Date(gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]).toDateString());
          return;
        }
        assert.equal(cell.querySelector('grid-cell').innerText, gridComponent.rows[indexRow][gridComponent.columns[indexCell].label]);
      });
    });
  }));

  it('should render correct value when we modify content, type number', fakeAsync(() => {
    var fixture = TestBed.createComponent(gridTestComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    gridComponent = fixture.componentInstance;
    var rows = document.querySelector('grid-body').querySelectorAll('.gridRow');
    var cells = rows[0].querySelectorAll('.gridCell');

    var doubleClick = new Event("dblclick", {'bubbles': true});
    doubleClick.shiftKey = true;

    cells[1].dispatchEvent(doubleClick);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    var input = document.querySelector('input');
    var oldValue = input.value;
    input.value = "test";
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    assert.equal(cells[1].querySelector('grid-cell').innerText, oldValue);

    cells[1].dispatchEvent(doubleClick);
    tick();
    fixture.detectChanges();
    input = document.querySelector('input');
    input.value = 123;
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    assert.equal(cells[1].querySelector('grid-cell').innerText, 123);

  }));

  it('should render correct value when we modify content, type text', fakeAsync(() => {
    var fixture = TestBed.createComponent(gridTestComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    gridComponent = fixture.componentInstance;
    var rows = document.querySelector('grid-body').querySelectorAll('.gridRow');
    var cells = rows[0].querySelectorAll('.gridCell');

    var doubleClick = new Event("dblclick", {'bubbles': true});
    doubleClick.shiftKey = true;

    cells[2].dispatchEvent(doubleClick);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    var input = document.querySelector('input');
    input.value = "test";
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    assert.equal(cells[2].querySelector('grid-cell').innerText, "test");

    cells[2].dispatchEvent(doubleClick);
    tick();
    fixture.detectChanges();
    input = document.querySelector('input');
    input.value = 123;
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    assert.equal(cells[2].querySelector('grid-cell').innerText, "123");

  }));

  it('should render correct value when we modify content, type date', fakeAsync(() => {
    var fixture = TestBed.createComponent(gridTestComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    gridComponent = fixture.componentInstance;
    var rows = document.querySelector('grid-body').querySelectorAll('.gridRow');
    var cells = rows[0].querySelectorAll('.gridCell');

    var doubleClick = new Event("dblclick", {'bubbles': true});
    doubleClick.shiftKey = true;

    cells[3].dispatchEvent(doubleClick);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    var input = document.querySelector('input');
    var oldValue = input.value;
    input.value = "123456789";
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    var correctDate = cells[3].querySelector('grid-cell').innerText;
    correctDate = correctDate.split("/");
    correctDate = correctDate[1] + "/" + correctDate[0] + "/" + correctDate[2];
    assert.strictEqual(new Date(correctDate).toDateString(), new Date(oldValue).toDateString());

    cells[3].dispatchEvent(doubleClick);
    tick();
    fixture.detectChanges();
    input = document.querySelector('input');
    input.value = "2003-03-03";
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    correctDate = cells[3].querySelector('grid-cell').innerText;
    correctDate = correctDate.split("/");
    correctDate = correctDate[1] + "/" + correctDate[0] + "/" + correctDate[2];
    assert.strictEqual(new Date(correctDate).toDateString(), new Date("2003-03-03").toDateString());

  }));

  it('should render correct value when we modify content, type boolean', fakeAsync(() => {
    var fixture = TestBed.createComponent(gridTestComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    gridComponent = fixture.componentInstance;
    var rows = document.querySelector('grid-body').querySelectorAll('.gridRow');
    var cells = rows[0].querySelectorAll('.gridCell');

    var doubleClick = new Event("dblclick", {'bubbles': true});
    doubleClick.shiftKey = true;

    cells[4].dispatchEvent(doubleClick);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    var input = document.querySelector('input');
    input.value = "test";
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    assert.equal(cells[4].querySelector('grid-cell').innerText, true);

    cells[4].dispatchEvent(doubleClick);
    tick();
    fixture.detectChanges();
    input = document.querySelector('input');
    input.value = "true";
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    assert.equal(cells[4].querySelector('grid-cell').innerText, true);

    cells[4].dispatchEvent(doubleClick);
    tick();
    fixture.detectChanges();
    input = document.querySelector('input');
    input.value = "";
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    assert.equal(cells[4].querySelector('grid-cell').innerText, false);

    cells[4].dispatchEvent(doubleClick);
    tick();
    fixture.detectChanges();
    input = document.querySelector('input');
    input.value = "0";
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    assert.equal(cells[4].querySelector('grid-cell').innerText, false);

  }));
});
