"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { getPriceHistory } from "@/app/action";

export const PriceChart = ({ productId, showCharts }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!showCharts) return;

    const fetchData = async () => {
      try {
        const history = await getPriceHistory(productId);
        // Format data to match chart keys
        const formattedData = history.map(item => ({
          date: item.checked_at,
          price: item.price
        }));
        setData(formattedData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showCharts, productId]);

  if (!showCharts) return null;
  if (loading) return <p className="text-gray-600 text-sm">Loading price history...</p>;
  if (!data.length) return <p className="text-gray-600 text-sm">No price history available.</p>;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="price" stroke="#f97316" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};
