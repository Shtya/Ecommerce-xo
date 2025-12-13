"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { FiSearch } from "react-icons/fi";
import NoOrders from "./NoOrders";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import Loading from "@/app/loading";

interface Order {
  id: number;
  order_number: string;
  status: string;
  formatted_total: string;
  items_count: number;
  created_at: string;
  can_cancel: boolean;
  items: any[];
}

export default function Orders() {
  const [search, setSearch] = useState<string>("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [page, setPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);

  const [apiToken, setApiToken] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Get token safely on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      setApiToken(token);
    }
  }, []);

  // Fetch orders with Pagination
  useEffect(() => {
    if (!apiToken) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/order?page=${page}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
        });

        const data = await res.json();
        console.log("Orders data:", data);
        if (data.status && data.data?.data) {
          setOrders(data.data.data);
          setLastPage(data.data.meta.last_page);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [apiToken, baseUrl, page]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Filter by search
  const filteredOrders = orders.filter((order) =>
    order.order_number.includes(search)
  );

  if (loading) return <Loading />;

  return (
    <div>
      {orders.length > 0 ? (
        <div>
          {/* Header */}
          <div className="border border-gray-200 rounded-xl p-4 mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-lg font-semibold">طلباتي</h2>

            <div className="flex flex-col md:flex-row gap-3 w-full">
              <div className="relative flex-1">
                <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="رقم الطلب , اسم المنتج"
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

             
            </div>
          </div>

          {filteredOrders.length > 0 ? (
            <div className="grid gap-4">
              {filteredOrders.map((order) => {
                const item = order.items?.[0];
                const img = item?.product?.image || "/images/noimg.png";
                const productName = item?.product?.name || "اسم المنتج";
                const productPrice =
                  item?.product?.final_price || item?.price_per_unit || 0;

                return (
                  <div key={order.id}>
                    <div className="rounded-2xl shadow border border-gray-100 overflow-hidden ">
                      <div className="bg-blue-50 flex items-center justify-between p-4">
                        <div className="text-[#475569] font-semibold gap-1 flex flex-col">
                          <p>
                            رقم الطلب :
                            <span className="font-bold mx-1">
                              {order.order_number}
                            </span>
                          </p>
                          <p>
                            الإجمالي :
                            <span className="font-bold mx-1">
                              {order.formatted_total}
                            </span>
                          </p>
                        </div>

                        <div className="gap-1 flex flex-col">
                          <Link href={`/myAccount/${order.id}`}>
                            <div className="flex items-center cursor-pointer ">
                              <p className="text-[#475569] font-semibold border-b border-[#475569] pb-0 mb-1">
                                عرض التفاصيل
                              </p>
                              <MdOutlineKeyboardArrowLeft className="text-[#898989]" />
                            </div>
                          </Link>

                          <p className="text-[#43454cb3] font-bold">
                            {order.created_at}
                          </p>
                        </div>
                      </div>

                      <div className="border border-gray-100 rounded-2xl m-4">
                        <div className="flex gap-5 ps-4 pt-4 relative ">
                          <Image
                            src={img}
                            alt={productName}
                            width={90}
                            height={97}
                            className="rounded-xl"
                          />

                          <span className="absolute rounded-full w-6 h-6 text-white bg-pro text-center top-2 start-24">
                            {order.items_count}
                          </span>

                          <div className="flex flex-col gap-1">
                            <p className="text-[#475569] my-2 font-semibold">
                              {productName}
                            </p>

                            <p className="text-[#43454cb2]">
                              سعر المنتج:
                              <span className="font-semibold mx-1">
                                {productPrice}
                              </span>
                              جنيه
                            </p>

                            <p className="text-[#43454cb2]">
                              رقم المنتج:
                              <span className="font-semibold mx-1">
                                #{item?.product?.id}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div
                          className={`ms-4 my-3 px-3 rounded-md w-fit text-[0.95rem] py-1 ${
                            order.status === "pending"
                              ? "bg-[#fef1df] text-[#a0640b]"
                              : order.status === "completed"
                              ? "bg-[#d1fae5] text-[#065f46]"
                              : order.status === "cancelled"
                              ? "bg-[#fee2e2] text-[#b91c1c]"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status === "pending"
                            ? "جاري التنفيذ"
                            : order.status === "completed"
                            ? "تم التنفيذ"
                            : order.status === "cancelled"
                            ? "ملغى"
                            : order.status}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <NoOrders title="ليس لديك أي طلبات" />
          )}

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex justify-center mt-6">
              <Stack spacing={2}>
                <Pagination
                  count={lastPage}
                  page={page}
                  onChange={(event, value) => setPage(value)}
                  color="primary"
                  sx={{
                    "& .MuiPaginationItem-icon": {
                      transform: "scaleX(-1)",
                    },
                  }}
                />
              </Stack>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center flex-col">
          <Image
            src="/images/noOrders.svg"
            width={330}
            height={220}
            alt="notfound"
          />
          <NoOrders title="ليس لديك أي طلبات حتى الآن." />
        </div>
      )}
    </div>
  );
}
