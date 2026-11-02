"use client";
import { useState } from "react";
import { toast } from "sonner";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { HeartSolid } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATALOG, type Fit, type Product } from "@/lib/catalog";
import type { pickShades } from "@/lib/shades";

export type Kind = keyof typeof CATALOG;
export type Pick = ReturnType<typeof pickShades>[number];
export type Look = {
  key: string;
  kind: Kind;
  product: Product;
  src: string;
  why: string;
  shade?: string;
};

export async function post<T>(url: string, body: FormData | object): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export const price = (n: number) => `$${n.toLocaleString("en-US")}`;
/** One try-on screen for either kind: grid → result on the user's face → save. */
export function Shop({
  photo,
  selfie,
  kind,
  fit,
  picks,
  onSave,
}: {
  photo: Blob;
  selfie: string;
  kind: Kind;
  fit: Fit;
  picks: Pick[];
  onSave: (l: Look) => void;
}) {
  const wig = kind === "wig";
  const [look, setLook] = useState<Look>();
  const [busy, setBusy] = useState(false);

  async function tryOn(product: Product, shade?: Pick) {
    setBusy(true);
    const form = new FormData();
    for (const [k, v] of Object.entries({ photo, kind, productId: product.id, shade: shade?.hex, fit })) if (v) form.append(k, v);
    const job = post<{ key: string; src: string }>("/api/look", form);
    toast.promise(job, {
      loading: `Putting ${product.name} on you…`,
      success: "Ready",
      error: (e) => e.message,
    });
    try {
      const { key, src } = await job;
      const why = shade ? `${shade.name}: ${shade.why.join(", ")}` : wig ? "In its own colour" : "For wig-off days";
      setLook({ key, kind, product, src, why, shade: shade?.hex });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3 md:sticky md:top-20 md:self-start">
        <div className="overflow-hidden rounded-2xl border bg-card aspect-[3/4]">
          {look && wig ? (
            <ReactCompareSlider
              itemOne={<ReactCompareSliderImage src={selfie} alt="You now" />}
              itemTwo={<ReactCompareSliderImage src={look.src} alt={`You in ${look.product.name}`} />}
              className="h-full"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={look?.src ?? selfie}
              alt={look ? `You in ${look.product.name}` : "Your selfie"}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        {look && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg">{look.product.name}</h3>
              <span className="font-mono text-sm">{price(look.product.price)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {look.why}.{wig && " Drag the line to compare."}
            </p>
            {wig && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Wig shade">
                {picks.map((s) => (
                  <Button
                    key={s.hex}
                    variant={look.shade === s.hex ? "default" : "outline"}
                    size="sm"
                    disabled={busy}
                    onClick={() => tryOn(look.product, s)}
                  >
                    <span className="size-3 rounded-full border" style={{ background: s.hex }} />
                    {s.name}
                  </Button>
                ))}
              </div>
            )}
            <Button className="w-full" size="lg" onClick={() => (onSave(look), toast.success("Saved to your shortlist"))}>
              <HeartSolid /> Save to shortlist
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 content-start">
        {CATALOG[kind].filter((p) => !p.for || p.for === fit).map((p) => (
          <button
            key={p.id}
            disabled={busy}
            onClick={() => tryOn(p)}
            className="group text-left rounded-xl border bg-card p-2 transition hover:border-input disabled:opacity-50 aria-pressed:border-brand aria-pressed:ring-2 aria-pressed:ring-brand/25"
            aria-pressed={look?.product.id === p.id}
          >
            <div className="mb-2 grid aspect-square place-items-center overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={wig ? p.thumb : `/${p.ref}`} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
            </div>
            <div className="text-sm font-medium leading-tight">{p.name}</div>
            <div className="text-xs text-muted-foreground">{p.detail}</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-xs">{price(p.price)}</span>
              {wig && (
                <Badge variant="outline" className="text-[10px]">
                  Final sale
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
