"use client";
import { ImageKitProvider } from "@imagekit/next";
import { SessionProvider } from "next-auth/react";

const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT!;

const ImageKitProviderWrapper = function ({ children }: { children: React.ReactNode }) {

    return (
        <SessionProvider>
            <ImageKitProvider urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
                {children}
            </ImageKitProvider>
        </SessionProvider>
    )
}

export default ImageKitProviderWrapper;