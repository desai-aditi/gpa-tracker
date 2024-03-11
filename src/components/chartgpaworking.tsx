import React, { useEffect, useState, useRef } from 'react';
import * as echarts from 'echarts/core';
import { Slider, Input, Select, Button, Switch, Radio } from 'antd';
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components';
import { BarChart, GaugeChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsType } from 'echarts/core';

import '../css/chartgpa.css'; // Import your custom styles

const { Option } = Select;

echarts.use([GridComponent, TooltipComponent, BarChart, GaugeChart, TitleComponent,CanvasRenderer]);

type Course = {
  name: string;
  grade: number;
  targetGrade?: number; // New field to store target grade
  weight: string;
};

type CalculationMode = 'unweighted' | 'weighted';

const CalculateGPA: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([
    { name: 'Course 1', grade: 75, weight: 'normal' },
    { name: 'Course 2', grade: 80, weight: 'normal' },
  ]);
  const [gpa, setGpa] = useState<number | null>(null);
  const [targetGpa, setTargetGpa] = useState<number | null>(null);
  const [isTargetMode, setIsTargetMode] = useState<boolean>(false);
  const [calculationMode, setCalculationMode] = useState<CalculationMode>('weighted'); // Added state
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      if (chartRef.current) {
        const myChart = echarts.init(chartRef.current);
        updateChart(myChart, courses, targetGpa, isTargetMode);
      }
      calculateGPA(courses, isTargetMode, calculationMode);
    } catch (error) {
      console.error('Error initializing chart:', error);
    }
  }, [courses, targetGpa, isTargetMode, calculationMode]);

  const handleGradeChange = (index: number, value: number) => {
    const newCourses = [...courses];
    if (isTargetMode) {
      // Adjust the target grade
      newCourses[index].targetGrade = value;
      calculateGPA(newCourses, isTargetMode, calculationMode);
    } else {
      // Adjust the current grade
      newCourses[index].grade = value;
    }
    setCourses(newCourses);
  };

  const handleAddCourse = () => {
    if (!isTargetMode) {
      const updatedCourses = [...courses, { name: `Course ${courses.length + 1}`, grade: 75, weight: 'normal' }];
      setCourses(updatedCourses);
      calculateGPA(updatedCourses, isTargetMode, calculationMode);
    }
  };

  const handleSwitchMode = () => {
    setIsTargetMode(!isTargetMode);
    // You may need logic here to initialize target grades if entering target mode for the first time
  };

  const updateChart = (chart: EChartsType, courses: Course[], targetGpa: number | null, isTargetMode: boolean) => {
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: ['Current Grade', 'Target Grade'],
      },
      xAxis: {
        type: 'category',
        data: courses.map(course => course.name),
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
      },
      series: [
        {
          name: 'Current Grade',
          type: 'bar',
          data: courses.map(course => course.grade),
          itemStyle: { color: '#5470C6' },
        },
        {
          name: 'Target Grade',
          type: 'bar',
          data: isTargetMode ? courses.map(course => course.targetGrade ?? course.grade) : [],
          itemStyle: { color: '#91CC75' },
        },
        // {
        //     type: 'gauge',
        //     startAngle: 180,
        //     endAngle: 0,
        //     center: ['25%', '75%'],
        //     radius: '90%',
        //     min: 0,
        //     max: 100,
        //     splitNumber: 8,
        //     axisLine: {
        //       lineStyle: {
        //         width: 6,
        //         color: [
        //           [0.25, '#FF6E76'],
        //           [0.5, '#FDDD60'],
        //           [0.75, '#58D9F9'],
        //           [1, '#7CFFB2'],
        //         ],
        //       },
        //     },
        //     pointer: {
        //       icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        //       length: '12%',
        //       width: 20,
        //       offsetCenter: [0, '-60%'],
        //       itemStyle: {
        //         color: 'auto',
        //       },
        //     },
        //     axisTick: {
        //       length: 12,
        //       lineStyle: {
        //         color: 'auto',
        //         width: 2,
        //       },
        //     },
        //     splitLine: {
        //       length: 20,
        //       lineStyle: {
        //         color: 'auto',
        //         width: 5,
        //       },
        //     },
        //     axisLabel: {
        //       color: '#464646',
        //       fontSize: 20,
        //       distance: -60,
        //       rotate: 'tangential',
        //       formatter: function (value) {
        //         return (value / 100) * 4 + ''; // Adjust this formula based on your GPA scale
        //       },
        //     },
        //     title: {
        //       offsetCenter: [0, '-10%'],
        //       fontSize: 20,
        //     },
        //     detail: {
        //       fontSize: 30,
        //       offsetCenter: [0, '-35%'],
        //       valueAnimation: true,
        //       formatter: function (value) {
        //         return Math.round((value / 100) * 4 * 100) / 100 + ''; // Adjust this formula based on your GPA scale
        //       },
        //       color: 'inherit',
        //     },
        //     data: [
        //       {
        //         value: currentGpa,
        //         name: 'Grade Rating',
        //       },
        //     ],
        // },
        // // Add a separate series for the target GPA gauge
        // {
        //   type: 'gauge',
        //   startAngle: 180,
        //   endAngle: 0,
        //   center: ['75%', '75%'],
        //   radius: '90%',
        //   min: 0,
        //   max: 100,
        //   splitNumber: 8,
        //   axisLine: {
        //     lineStyle: {
        //       width: 6,
        //       color: [
        //         [0.25, '#FF6E76'],
        //         [0.5, '#FDDD60'],
        //         [0.75, '#58D9F9'],
        //         [1, '#7CFFB2'],
        //       ],
        //     },
        //   },
        //   pointer: {
        //     icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        //     length: '12%',
        //     width: 20,
        //     offsetCenter: [0, '-60%'],
        //     itemStyle: {
        //       color: 'auto',
        //     },
        //   },
        //   axisTick: {
        //     length: 12,
        //     lineStyle: {
        //       color: 'auto',
        //       width: 2,
        //     },
        //   },
        //   splitLine: {
        //     length: 20,
        //     lineStyle: {
        //       color: 'auto',
        //       width: 5,
        //     },
        //   },
        //   axisLabel: {
        //     color: '#464646',
        //     fontSize: 20,
        //     distance: -60,
        //     rotate: 'tangential',
        //     formatter: function (value) {
        //       return (value / 100) * 4 + ''; // Adjust this formula based on your GPA scale
        //     },
        //   },
        //   title: {
        //     offsetCenter: [0, '-10%'],
        //     fontSize: 20,
        //   },
        //   detail: {
        //     fontSize: 30,
        //     offsetCenter: [0, '-35%'],
        //     valueAnimation: true,
        //     formatter: function (value) {
        //       return Math.round((value / 100) * 4 * 100) / 100 + ''; // Adjust this formula based on your GPA scale
        //     },
        //     color: 'inherit',
        //   },
        //   data: [
        //     {
        //       value: targetGpa,
        //       name: 'Target Grade Rating',
        //     },
        //   ],
        // },
      ],
    };

    chart.setOption(option);
  };

  
  const calculateGPA = (updatedCourses: Course[], isTargetMode: boolean, mode: CalculationMode) => {
    let totalOriginalPoints = 0;
    let totalCourses = updatedCourses.length;

    updatedCourses.forEach(course => {
      let points = 0;

      if (mode === 'weighted') {
        if (course.grade >= 90) points = 4.0;
        else if (course.grade >= 80) points = 3.0;
        else if (course.grade >= 70) points = 2.0;
        else if (course.grade >= 60) points = 1.0;

        if (course.weight === 'honors') points += 0.5;
        else if (course.weight === 'ap') points += 1.0;
      } else {
        // 'unweighted' mode
        if (course.grade >= 90) points = 4.0;
        else if (course.grade >= 80) points = 3.0;
        else if (course.grade >= 70) points = 2.0;
        else if (course.grade >= 60) points = 1.0;
      }

      totalOriginalPoints += points;
    });

    const newGPA = totalOriginalPoints / totalCourses;
    setGpa(newGPA);

    if (isTargetMode) {
      // Calculate target GPA
      let targetPoints = 0;
      updatedCourses.forEach(course => {
        let targetCoursePoints = 0;
        if (course.targetGrade !== undefined) {
          if (mode === 'weighted') {
            if (course.targetGrade >= 90) targetCoursePoints = 4.0;
            else if (course.targetGrade >= 80) targetCoursePoints = 3.0;
            else if (course.targetGrade >= 70) targetCoursePoints = 2.0;
            else if (course.targetGrade >= 60) targetCoursePoints = 1.0;

            if (course.weight === 'honors') targetCoursePoints += 0.5;
            else if (course.weight === 'ap') targetCoursePoints += 1.0;
          } else {
            // 'unweighted' mode
            if (course.targetGrade >= 90) targetCoursePoints = 4.0;
            else if (course.targetGrade >= 80) targetCoursePoints = 3.0;
            else if (course.targetGrade >= 70) targetCoursePoints = 2.0;
            else if (course.targetGrade >= 60) targetCoursePoints = 1.0;
          }
        }
        targetPoints += targetCoursePoints;
      });

      const newTargetGPA = targetPoints / totalCourses;
      setTargetGpa(newTargetGPA);
    }
  };

  return (
      <div>
        <h1>
            {`Current GPA: ${gpa !== null ? gpa.toFixed(2) : 'N/A'}`}
        </h1>

        <h1>
            {isTargetMode ? ` Target GPA: ${targetGpa !== null ? targetGpa.toFixed(2) : 'N/A'}` : ''}
        </h1>

        <div className="chart-gpa-container">
          <div ref={chartRef} style={{ width: '100%', height: '400px' }}></div>
          <Radio.Group
            onChange={(e) => setCalculationMode(e.target.value)}
            value={calculationMode}
            style={{ marginBottom: '10px' }}
            >
            <Radio value="weighted">Weighted</Radio>
            <Radio value="unweighted">Unweighted</Radio>
        </Radio.Group>

          <div>
            {courses.map((course, index) => (
              <div key={index} className="course-container">
                <Input
                  placeholder="Course Name"
                  value={course.name}
                  onChange={(e) => {
                    const newCourses = [...courses];
                    newCourses[index].name = e.target.value;
                    setCourses(newCourses);
                  }}
                  style={{ width: 200, marginRight: '10px' }}
                  disabled={isTargetMode} // Disabled in target mode
                />
                <Slider
                  min={0}
                  max={100}
                  onChange={(value) => handleGradeChange(index, value)}
                  value={isTargetMode ? course.targetGrade ?? course.grade : course.grade}
                />
                {calculationMode === 'weighted' && (
                    <Select
                        defaultValue="normal"
                        value={course.weight}
                        style={{ width: 120, marginLeft: '10px' }}
                        onChange={(value) => {
                            const newCourses = [...courses];
                            newCourses[index].weight = value;
                            setCourses(newCourses);
                        }}
                        disabled={isTargetMode} // Keep this disabled in target mode if you don't want weight changes there
                        >
                        <Option value="normal">Normal</Option>
                        <Option value="honors">Honors</Option>
                        <Option value="ap">AP</Option>
                    </Select>
                )}
              </div>
            ))}
            <Button onClick={handleAddCourse} disabled={isTargetMode}>
              Add More
            </Button>
            <Switch checkedChildren="Target Mode" unCheckedChildren="Current Mode" checked={isTargetMode} onChange={handleSwitchMode} />
          </div>
        </div>
      </div>
  );
}  

export default CalculateGPA;
