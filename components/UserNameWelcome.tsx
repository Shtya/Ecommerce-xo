
'use client'
import { useAuth } from "@/src/context/AuthContext";
export default function UserNameWelcome() {
    const { userName } = useAuth();
  return (
    <>
     <p className="text-xl">
            مرحبا
            <span>{userName}</span>, كيف يمكننا مساعدتك؟
          </p>
    </>
  )
}
