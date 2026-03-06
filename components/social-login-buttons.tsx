"use client";

import { Button } from "@/components/ui/button";

type Props = {
  callbackUrl: string;
  hasGoogle: boolean;
  hasX: boolean;
  hasFacebook: boolean;
};

export function SocialLoginButtons({ callbackUrl, hasGoogle, hasX, hasFacebook }: Props) {
  const beginOauth = async (provider: "google" | "twitter" | "facebook") => {
    const csrfResponse = await fetch("/api/auth/csrf", { method: "GET" });
    if (!csrfResponse.ok) {
      window.location.href = "/api/auth/error?error=Configuration";
      return;
    }

    const csrfPayload = (await csrfResponse.json()) as { csrfToken?: string };
    const csrfToken = csrfPayload.csrfToken;
    if (!csrfToken) {
      window.location.href = "/api/auth/error?error=Configuration";
      return;
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/api/auth/signin/${provider}`;

    const csrfInput = document.createElement("input");
    csrfInput.type = "hidden";
    csrfInput.name = "csrfToken";
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    const callbackInput = document.createElement("input");
    callbackInput.type = "hidden";
    callbackInput.name = "callbackUrl";
    callbackInput.value = callbackUrl;
    form.appendChild(callbackInput);

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="space-y-3">
      <Button
        className="w-full"
        variant="outline"
        type="button"
        onClick={() => {
          if (!hasGoogle) {
            window.location.href = "/backend?setup=google";
            return;
          }
          void beginOauth("google");
        }}
      >
        Continue with Google{!hasGoogle ? " (setup required)" : ""}
      </Button>

      <Button
        className="w-full"
        variant="outline"
        type="button"
        onClick={() => {
          if (!hasX) {
            window.location.href = "/backend?setup=x";
            return;
          }
          void beginOauth("twitter");
        }}
      >
        Continue with X{!hasX ? " (setup required)" : ""}
      </Button>

      <Button
        className="w-full"
        variant="outline"
        type="button"
        onClick={() => {
          if (!hasFacebook) {
            window.location.href = "/backend?setup=facebook";
            return;
          }
          void beginOauth("facebook");
        }}
      >
        Continue with Facebook{!hasFacebook ? " (setup required)" : ""}
      </Button>
    </div>
  );
}
