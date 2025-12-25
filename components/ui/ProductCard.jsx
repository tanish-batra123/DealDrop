"use client";

import { deleteProduct } from "@/app/action";
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { TrendingDown, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";
import { PriceChart } from "./PriceChart";

export const ProductCard = ({ product }) => {
  const [showCharts, setShowCharts] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Remove this product from tracking?")) return;

    setDeleting(true);
    const result = await deleteProduct(product.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || "Product deleted successfully");
      setShowCharts(false);
    }
    setDeleting(false);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow w-full max-w-full sm:max-w-lg mx-auto px-2 sm:px-4 my-2">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full max-w-xs sm:w-20 sm:h-20 object-cover rounded-md border"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium sm:font-semibold text-gray-900 text-base sm:text-lg line-clamp-2 mb-1">
              {product.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl sm:text-2xl font-semibold sm:font-bold text-orange-500">
                {product.currency} {product.current_price}
              </span>
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                <TrendingDown className="w-3 h-3" />
                Tracking
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* CardContent with all buttons */}
      <CardContent className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(product.url, "_blank")}
          className="flex-1 sm:flex-auto flex items-center justify-center gap-2"
        >
          View Product
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 sm:flex-auto flex items-center justify-center gap-2"
        >
          <Trash size={16} />
          {deleting ? "Deleting..." : "Delete"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCharts(!showCharts)}
          className="flex-1 sm:flex-auto flex items-center justify-center gap-2"
        >
          {showCharts ? "Hide Charts" : "View Charts"}
          {showCharts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </CardContent>

      {/* CardFooter shows chart only */}
      {showCharts && (
        <CardFooter className="p-3 sm:p-4 bg-gray-100 rounded mt-2">
          <PriceChart productId={product.id} showCharts={showCharts}/>
        </CardFooter>
      )}
    </Card>
  );
};
