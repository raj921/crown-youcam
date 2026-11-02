"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Camera, Palette, Crown, Hat, HeartSolid, Download, ShareIos, ShieldCheck, ArrowRight } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadEmpty } from "@/components/spectrumui/blocks/empty-states/upload-empty";
import { EmptyAction, EmptyState, IconBookmark } from "@/components/spectrumui/blocks/empty-states/empty-state-kit";
import { ShareButton } from "@/components/spectrumui/share-button";
import { Shop, post, price, type Look } from "@/components/shop";
import { pickShades, undertone, type Colours } from "@/lib/shades";
import type { Fit } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const STEPS = [
  { name: "Selfie", icon: Camera },
  { name: "Your colours", icon: Palette },
  { name: "Wigs", icon: Crown },
  { name: "Wig-off days", icon: Hat },
  { name: "Shortlist", icon: HeartSolid },
];

// One segmented-control style (Interfere tabs) for the step nav and the style switch.
const TAB =
  "flex h-8 items-center gap-1.5 rounded-[10px] px-2.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-35 aria-[current=step]:bg-accent aria-[current=step]:text-foreground aria-pressed:bg-accent aria-pressed:text-foreground";
const FITS: { value: Fit; name: string }[] = [
  { value: "f", name: "Feminine styles" },
  { value: "m", name: "Masculine styles" },
];

/** Share the look with family or a stylist through the phone's share sheet; fall back to a download. */
async function share(l: Look, viaSheet: boolean) {
  const file = new File([await (await fetch(l.src)).blob()], `crown-${l.product.id}.jpg`, { type: "image/jpeg" });
  if (viaSheet && navigator.canShare?.({ files: [file] }))
    return navigator.share({ files: [file], text: `Me in ${l.product.name} (${price(l.product.price)}), previewed with Crown` });
  Object.assign(document.createElement("a"), { href: URL.createObjectURL(file), download: file.name }).click();
}

/** Same header on every step: where you are, what this is, what to do. */
function Section({ step, title, intro, children }: { step: number; title: string; intro: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <header className="space-y-1.5">
        <p className="font-mono text-xs text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 className="text-2xl md:text-3xl">{title}</h2>
        <p className="max-w-prose text-sm text-muted-foreground">{intro}</p>
      </header>
      {children}
    </section>
  );
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [me, setMe] = useState<{ photo: Blob; selfie: string; colours: Colours; detected: Fit | null }>();
  const [saved, setSaved] = useState<Look[]>([]);
  const [fit, setFit] = useState<Fit>("f");
  const picks = me ? pickShades(me.colours) : [];

  async function submitSelfie(file?: Blob | null) {
    if (!file) return;
    const form = new FormData();
    form.append("photo", file);
    const job = post<{ colours: Colours; fit: Fit | null }>("/api/selfie", form);
    toast.promise(job, { loading: "Reading your colours…", success: "Got it", error: (e) => e.message });
    const { colours, fit: detected } = await job;
    setMe({ photo: file, colours, detected, selfie: URL.createObjectURL(file) });
    setFit(detected ?? "f");
    setStep(1);
  }
  const demo = async () => submitSelfie(await (await fetch("/demo.jpg")).blob());
  const save = (l: Look) => setSaved((s) => [...s.filter((x) => x.key !== l.key), l]);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b bg-shell/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <button onClick={() => setStep(0)} className="flex items-center gap-2 rounded-lg text-[15px] font-medium" aria-label="Crown, back to start">
            <Crown className="size-5 text-brand" />
            <span className="hidden sm:inline">Crown</span>
          </button>
          <nav aria-label="Steps" className="ml-auto flex items-center gap-0.5 rounded-xl border bg-card p-0.5">
            {STEPS.map(({ name, icon: Icon }, i) => (
              <button
                key={name}
                disabled={!me && i > 0}
                onClick={() => setStep(i)}
                aria-current={step === i ? "step" : undefined}
                aria-label={name}
                className={TAB}
              >
                <Icon className="size-4" />
                <span className={cn("hidden md:inline", step === i && "inline")}>{name}</span>
                {i === 4 && saved.length > 0 && <span className="font-mono text-[11px] text-brand">{saved.length}</span>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-8 md:py-12">
        {step === 0 && (
          <section className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-5">
              <h1 className="font-display text-4xl leading-[1.1] md:text-5xl">
                Choose your wig while your own hair is <em>still here to match.</em>
              </h1>
              <p className="max-w-prose text-muted-foreground">
                Most wigs can&apos;t be returned. See each one on your own face first, in a shade picked from your hair, brows and skin.
              </p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0" /> Your photo is deleted from YouCam as soon as your results are ready.
              </p>
            </div>
            <div className="space-y-3">
              <UploadEmpty
                panelTitle="Your selfie"
                title="Take or upload one selfie"
                description="Face the camera, hair pulled back if you can."
                accept="image/jpeg,image/png"
                maxLabel="JPEG or PNG up to 8 MB"
                browseLabel="Choose a photo"
                onFiles={(files) => submitSelfie(files[0]).catch(() => {})}
              />
              <Button variant="ghost" className="w-full" onClick={() => demo().catch(() => {})}>
                Or try it with our demo photo
              </Button>
            </div>
          </section>
        )}

        {step === 1 && me && (
          <Section
            step={1}
            title="Your colours"
            intro={
              <>
                Read from your selfie. Your undertone looks <b className="font-medium text-foreground">{undertone(me.colours.skin_color)}</b>{" "}
                (estimated from skin colour).
              </>
            }
          >
            <div className="grid max-w-sm grid-cols-4 gap-2">
              {(["skin", "eyebrow", "eye", "lip"] as const)
                .filter((k) => me.colours[`${k}_color`])
                .map((k) => (
                  <div key={k} className="space-y-1.5 text-center">
                    <div className="aspect-square rounded-xl border" style={{ background: me.colours[`${k}_color`] }} />
                    <div className="text-xs capitalize">{k === "eyebrow" ? "brows" : k}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{me.colours[`${k}_color`]}</div>
                  </div>
                ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {picks.map((s, i) => (
                <div key={s.hex} className="flex gap-3 rounded-2xl border bg-card p-4">
                  <div className="size-11 shrink-0 rounded-full border" style={{ background: s.hex }} />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                      {s.name}
                      {i === 0 && (
                        <Badge variant="outline" className="text-[10px]">
                          Best match
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{s.why.join(", ")}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
              <span className="text-sm font-medium">Show me</span>
              <div role="group" aria-label="Style set" className="inline-flex gap-0.5 rounded-xl border bg-background p-0.5">
                {FITS.map((f) => (
                  <button key={f.value} aria-pressed={fit === f.value} onClick={() => setFit(f.value)} className={TAB}>
                    {f.name}
                  </button>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {me.detected ? "Picked from your photo. Change it if it isn't right for you." : "Choose the styles you'd like to try."}
              </span>
            </div>
          </Section>
        )}

        {(step === 2 || step === 3) && me && (
          <Section
            step={step}
            title={step === 2 ? "Wigs, on you" : "Wig-off days"}
            intro={step === 2 ? "Tap a wig to see it on your face, then try your best shades." : "Headscarves and caps for the days you skip the wig."}
          >
            <Shop key={step + fit} photo={me.photo} selfie={me.selfie} picks={picks} fit={fit} kind={step === 2 ? "wig" : "cover"} onSave={save} />
          </Section>
        )}

        {step === 4 && (
          <Section step={4} title="Your shortlist" intro="Everything here was previewed on you. Share it with family or your stylist before you buy.">
            {saved.length === 0 ? (
              <EmptyState
                icon={<IconBookmark />}
                title="Nothing saved yet"
                description="Try a wig on and tap Save. Your picks land here side by side."
                actions={<EmptyAction onClick={() => setStep(2)}>Browse wigs</EmptyAction>}
                className="rounded-2xl border bg-card py-12"
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((l) => (
                  <article key={l.key} className="overflow-hidden rounded-2xl border bg-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.src} alt={`You in ${l.product.name}`} className="aspect-[3/4] w-full object-cover" />
                    <div className="space-y-3 p-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-base">{l.product.name}</h3>
                        <span className="font-mono text-sm">{price(l.product.price)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{l.why}</p>
                      <div className="flex items-center justify-between gap-2">
                        {l.kind === "wig" ? <Badge variant="outline">Final sale · previewed on you</Badge> : <span />}
                        <ShareButton
                          label="Share this look"
                          direction="left"
                          size="sm"
                          actions={[
                            { icon: <ShareIos />, label: "Share with family or stylist", onSelect: () => void share(l, true) },
                            { icon: <Download />, label: "Save image", onSelect: () => void share(l, false) },
                          ]}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Section>
        )}

        {me && step > 0 && step < STEPS.length - 1 && (
          <div className="flex justify-end border-t pt-6">
            <Button size="lg" onClick={() => setStep(step + 1)}>
              Next: {STEPS[step + 1].name} <ArrowRight />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
