const A4Width = 1004;
const A4Height = 1410;
const SlipWidth = 374;
const SlipHeight = 1410;

const templateTypes = [
  {id: 1, NameEN: 'Invoice', NameTH: 'ใบแจ้งหนี้'},
  {id: 2, NameEN: 'Bill', NameTH: 'บิลเงินสด/ใบเสร็จรับเงิน'},
  {id: 3, NameEN: 'Tax-Invoice', NameTH: 'ใบกำกับภาษี'}
];

const paperSizes = [
  {id: 1, NameEN: 'A4', NameTH: 'A4', width: A4Width},
  {id: 2, NameEN: 'Slip', NameTH: 'Slip', width: SlipWidth}
];

const defaultTableData = [
  {id: 'headerRow', backgroundColor: '#ddd', fields: [
      {id: 'headerCell_1', cellData: 'ลำดับที่', fontweight: 'bold', fontalign: 'center', width: '10%'},
      {id: 'headerCell_2', cellData: 'รายการสินค้า', fontweight: 'bold', fontalign: 'center', width: '34%'},
      {id: 'headerCell_3', cellData: 'ราคาต่อหน่วย', fontweight: 'bold', fontalign: 'center', width: '20%'},
      {id: 'headerCell_4', cellData: 'จำนวน', fontweight: 'bold', fontalign: 'center', width: '13%'},
      {id: 'headerCell_5', cellData: 'รวม', fontweight: 'bold', fontalign: 'center', width: '19%'}
    ]
  },
  {id: 'dataRow', class: 'gooditem', fields: [
      {id: 'dataCell_1', type: "dynamic", cellData: '$gooditem_no', fontweight: 'normal', fontalign: 'center', width: '10%'},
      {id: 'dataCell_2', type: "dynamic", cellData: '$gooditem_name', fontweight: 'normal', fontalign: 'left', width: '34%'},
      {id: 'dataCell_3', type: "dynamic", cellData: '$gooditem_price', fontweight: 'normal', fontalign: 'center', width: '20%'},
      {id: 'dataCell_4', type: "dynamic", cellData: '$gooditem_qty', fontweight: 'normal', fontalign: 'center', width: '13%'},
      {id: 'dataCell_5', type: "dynamic", cellData: '$gooditem_total', fontweight: 'normal', fontalign: 'right', width: '19%'}
    ]
  },
  {id: 'totalRow', fields: [
      {id: 'totalCell_1', cellData: 'รวมค่าสินค้า', fontweight: 'normal', fontalign: 'center', width: '78%'},
      {id: 'totalCell_2', type: "dynamic", cellData: '$total', fontweight: 'normal', fontalign: 'right', width: '19%'}
    ]
  },
  {id: 'discountRow', fields: [
      {id: 'discountCell_1', cellData: 'ส่วนลด', fontweight: 'normal', fontalign: 'center', width: '78%'},
      {id: 'discountCell_2', type: "dynamic", cellData: '$discount', fontweight: 'normal', fontalign: 'right', width: '19%'}
    ]
  },
  {id: 'vatRow', fields: [
      {id: 'vatCell_1', cellData: 'ภาษีมูลค่าเพิ่ม 7%', fontweight: 'normal', fontalign: 'center', width: '78%'},
      {id: 'vatCell_2', type: "dynamic", cellData: '$vat', fontweight: 'normal', fontalign: 'right', width: '19%'}
    ]
  },
  {id: 'grandTotalRow', backgroundColor: '#ddd', fields: [
      {id: 'grandTotalCell_1', cellData: 'รวมทั้งหมด', fontweight: 'bold', fontalign: 'center', width: '78%'},
      {id: 'grandTotalCell_2', type: "dynamic", cellData: '$grandtotal', fontweight: 'bold', fontalign: 'right', width: '19%'}
    ]
  }
]

module.exports = {
  A4Width,
  A4Height,
  SlipWidth,
  SlipHeight,
  templateTypes,
  paperSizes,
  defaultTableData
}
