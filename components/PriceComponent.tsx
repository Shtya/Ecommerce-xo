import React from 'react'
interface PriceProp{
  final_price:any
}
export default function PriceComponent({final_price}:PriceProp) {
  return (
    <>
     <div className="flex gap-1">
          <h3 className="font-bold text-xl">{final_price}</h3>
          <span className="mt-1.5">ريال</span>
        </div>
    </>
  )
}
