import React from 'react';
import HeroSection from './HeroSection';
import ThesisWorkflow from './ThesisWorkFlow';
import RecentFAQs from './RecentFAQs';
import Seacrh from './Search';

const Home = () => {
    return (
        <div>
            <HeroSection></HeroSection>
            <Seacrh></Seacrh>
            <ThesisWorkflow></ThesisWorkflow>
            <RecentFAQs></RecentFAQs>
        </div>
    );
};

export default Home;