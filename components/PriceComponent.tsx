import React from 'react'

export default function PriceComponent({ start, final_price }: any) {
	return (
		<>
			<div className="flex gap-1">
				<div className='flex items-center gap-1'>
					{start && <span className='font-[400] opacity-50 ' >يبدأ من </span>}
					<h3 className="font-bold text-xl  text-[#14213d]">{final_price?.toFixed(2)}</h3>
				</div>
				<span className="mt-1 ">ريال</span>
			</div>
		</>
	)
}
