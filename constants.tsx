
import React from 'react';

export const ChevronDown = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6"/></svg>
);

export const ChevronRight = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
);

export const ChevronLeft = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>
);

export const CheckCircle2 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);

export const Loader2 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export const Lock = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

export const Truck = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
);

export const CanRateCompareLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 400 140" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g transform="translate(200, 10)">
            {/* Shield Icon based on user image */}
            <g transform="translate(-30, 0)">
                {/* Left Half - Blue */}
                <path d="M30 0C20 0 5 4 5 15V35C5 50 30 65 30 65V0Z" fill="#1e40af" />
                {/* Right Half - Green */}
                <path d="M30 0V65C30 65 55 50 55 35V15C55 4 40 0 30 0Z" fill="#28a745" />
                {/* Heart in center */}
                <path d="M30 42C30 42 26 38 23 35C21 33 21 30 23 28C25 26 28 26 30 29C32 26 35 26 37 28C39 30 39 33 37 35C34 38 30 42 30 42Z" fill="white" />
            </g>
            
            {/* Main Brand Text */}
            <text x="0" y="105" textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight="900" fontSize="36" fill="#1e40af" letterSpacing="0.5px">
                CAN RATE COMPARE
            </text>
        </g>
    </svg>
);

/** @deprecated Use CanRateCompareLogo instead */
export const SmartFamilyLogo = CanRateCompareLogo;

export const PROVINCES = [
    'AB – Alberta', 'BC – British Columbia', 'MB – Manitoba', 'NB – New Brunswick',
    'NL – Newfoundland and Labrador', 'NS – Nova Scotia', 'NT – Northwest Territories',
    'NU – Nunavut', 'ON – Ontario', 'PE – Prince Edward Island', 'QC – Quebec',
    'SK – Saskatchewan'
];
