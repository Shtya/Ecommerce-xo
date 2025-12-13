
import UserNameWelcome from "@/components/UserNameWelcome";
import Link from "next/link";

import { TfiMenuAlt } from "react-icons/tfi";
import { TiMessages } from "react-icons/ti";
export default function page() {
   
  return (
    <>
      <div className="rounded-2xl shadow-md  px-4 py-8 flex flex-col gap-3 help">
        <div className="-scale-x-100">
          <h4 className="font-semibold text-2xl mb-3">مركز المساعدة</h4>
          {/* welcome */}
          <UserNameWelcome/>
        </div>
      </div>
      <div className="rounded-2xl shadow-md   px-4 py-8 bg-white my-4">
        <h4 className="text-3xl font-semibold mb-5">المقالات الشائعة</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3  gap-4">
          <Link href="/FAQ" aria-label="help center">
            <div className="flex items-center rounded-xl border border-gray-300  py-3 px-3 gap-3">
              <div className="bg-[#eff6ff] text-[#233a7d] p-2.5 rounded-lg">
                <TiMessages size={25} />
              </div>
              <div>
                <h5 className="font-semibold text-xl text-black/80">
                  الأسئلة الشائعة
                </h5>
                <p className="text-gray-600 my-1 text-md">
                  تعرف على المزيد حول الاسترداد، الدفع عند الاستلام، والضمان
                </p>
              </div>
            </div>
          </Link>
       

          <Link href="/returnsPolicy" aria-label="policy">
            <div className="flex items-center rounded-xl border border-gray-300  py-3 px-3 gap-3">
              <div className="bg-[#eff6ff] text-[#233a7d] p-2.5 rounded-lg">
                <TfiMenuAlt size={21} />
              </div>
              <div>
                <h5 className="font-semibold text-xl text-black/80">
                  سياسة الاسترجاع
                </h5>
                <p className="text-gray-600 my-1 text-md">
                  تعرف على شروط وإجراءات الاسترجاع بسهولة
                </p>
              </div>
            </div>
          </Link>
          <Link href="/policy" aria-label="policy">
            <div className="flex items-center rounded-xl border border-gray-300  py-3 px-3 gap-3">
              <div className="bg-[#eff6ff] text-[#233a7d] p-2.5 rounded-lg">
                <TfiMenuAlt size={21} />
              </div>
              <div>
                <h5 className="font-semibold text-xl text-black/80">
                  سياسة الخصوصية
                </h5>
                <p className="text-gray-600 my-1 text-md">
                  كيف نحمي بياناتك ونضمن خصوصيتك
                </p>
              </div>
            </div>
          </Link>

          <Link href="/terms" aria-label="terms">
            <div className="flex items-center rounded-xl border border-gray-300  py-3 px-3 gap-3">
              <div className="bg-[#eff6ff] text-[#233a7d] p-2.5 rounded-lg">
                <TfiMenuAlt size={21} />
              </div>
              <div>
                <h5 className="font-semibold text-xl text-black/80">
                  الشروط والأحكام
                </h5>
                <p className="text-gray-600 my-1 text-md">
                  القواعد التي تنظم استخدامك لخدماتنا
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
