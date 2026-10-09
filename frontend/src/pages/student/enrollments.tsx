import { useState } from "react";
import { PlusCircle, ArrowRightLeft, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/lib/auth-store";
import { useEnrollmentStore } from "@/lib/enrollment-store";

export default function StudentEnrollmentsPage() {
  const studentId = useAuthStore((s) => s.studentId);
  const { students, courses, enrollments, enroll, updateEnrollment, dropEnrollment} = useEnrollmentStore();

  const [open, setOpen] = useState(false);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [newCourseId, setNewCourseId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [droppingCourseId, setDroppingCourseId] = useState<string | null>(null);


  const me = students.find((s) => s.studentId === studentId);
  const myEnrollments = enrollments.filter((e) => e.studentId === studentId);

  const courseOptions = courses
    .filter((c) => !myEnrollments.some((e) => e.courseId === c.courseId))
    .map((c) => ({
      value: c.courseId,
      label: `${c.courseId} — ${c.courseTitle}`,
    }));

  const courseOf = (courseId: string) =>
    courses.find((c) => c.courseId === courseId);

  
  const availableCourses = courses
    .filter((c) => !myEnrollments.some((e) => e.courseId === c.courseId))
    .map((c) => ({
      value: c.courseId,
      label: `${c.courseId} — ${c.courseTitle}`,
    }));

  const handleEditOpen = (courseId: string) => {
    setEditingCourseId(courseId);
    setNewCourseId(null);
    setEditError(null);
    setEditOpen(true);
  };

  const handleEditOpenChange = (next: boolean) => {
    setEditOpen(next);
    if (!next) {
      setEditingCourseId(null);
      setNewCourseId(null);
      setEditError(null);
    }
  };

  const handleUpdateEnrollment = async () => {
    if (!studentId || !editingCourseId || !newCourseId) return;

    setEditSubmitting(true);
    setEditError(null);

    try {
      await updateEnrollment(studentId, editingCourseId, newCourseId);
      handleEditOpenChange(false);
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDropEnrollment = async (courseId: string) => {
    if (!studentId) return;

    setDroppingCourseId(courseId);
    setDropError(null);

    try {
      await dropEnrollment(studentId, courseId);
    } catch (err) {
      setDropError((err as Error).message);
    } finally {
      setDroppingCourseId(null);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setFormCourse(null);
      setServerError(null);
    }
  };

  const handleEnroll = async () => {
    if (!studentId || !formCourse) return;
    setSubmitting(true);
    setServerError(null);
    try {
      await enroll(studentId, formCourse);
      handleOpenChange(false);
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
          <p className="text-sm text-muted-foreground">
            {me
              ? `${me.studentId} — ${me.firstName} ${me.lastName} (${me.program})`
              : (studentId ?? "-")}{" "}
            · ลงทะเบียนแล้ว {myEnrollments.length} วิชา
          </p>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger render={<Button disabled={!studentId} />}>
            <PlusCircle className="h-4 w-4" />
            ลงทะเบียนเรียน
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>ลงทะเบียนเรียน</DialogTitle>
              <DialogDescription>
                เลือกวิชาที่ยังไม่ได้ลงทะเบียน
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <Select
                items={courseOptions}
                value={formCourse}
                onValueChange={(v) => setFormCourse(v as string)}
              >
                <SelectTrigger id="formCourse" className="w-full">
                  <SelectValue
                    placeholder={
                      courseOptions.length === 0
                        ? "ลงทะเบียนครบทุกวิชาแล้ว"
                        : "เลือกวิชา"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {courseOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}
            <DialogFooter>
              <Button
                disabled={!formCourse || submitting}
                onClick={handleEnroll}
              >
                <PlusCircle className="h-4 w-4" />
                {submitting ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        
        <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>เปลี่ยนวิชาที่ลงทะเบียน</DialogTitle>
              <DialogDescription>
                วิชาเดิม: {editingCourseId ?? "-"} — เลือกวิชาใหม่ที่ยังไม่ได้ลงทะเบียน
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-1.5">
              <Label htmlFor="newCourseId">วิชาใหม่</Label>
              <Select
                items={availableCourses}
                value={newCourseId}
                onValueChange={(v) => setNewCourseId(v as string)}
              >
                <SelectTrigger id="newCourseId" className="w-full">
                  <SelectValue placeholder="เลือกวิชาใหม่" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editError && (
              <p className="text-sm text-destructive">{editError}</p>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleEditOpenChange(false)}
                disabled={editSubmitting}
              >
                ยกเลิก
              </Button>
              <Button
                disabled={!newCourseId || editSubmitting}
                onClick={handleUpdateEnrollment}
              >
                {editSubmitting ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        {dropError && (
          <p className="text-sm text-destructive" role="alert">
            {dropError}
          </p>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead>วันที่ลงทะเบียน</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {myEnrollments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-20 text-center text-muted-foreground"
                >
                  ยังไม่ได้ลงทะเบียนวิชาใด
                </TableCell>
              </TableRow>
            )}
            {myEnrollments.map((e) => {
              const course = courseOf(e.courseId);
              return (
                <TableRow key={e.courseId}>
                  <TableCell>{e.courseId}</TableCell>
                  <TableCell>{course?.courseTitle ?? "-"}</TableCell>
                  <TableCell>{course?.instructors.join(", ") || "-"}</TableCell>
                  <TableCell>
                    {e.enrolledAt
                      ? new Date(e.enrolledAt).toLocaleString("th-TH")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`เปลี่ยนวิชา ${e.courseId}`}
                        title="เปลี่ยนวิชา"
                        onClick={() => handleEditOpen(e.courseId)}
                        disabled={droppingCourseId !== null}
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>

                      <Button
                        onClick={() => handleDropEnrollment(e.courseId)}
                        disabled={droppingCourseId !== null}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
