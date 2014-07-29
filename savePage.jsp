<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@page import="java.io.PrintWriter"%>
<%@page import="java.io.File"%>
<%@page import="java.io.FileWriter"%>
<%
	PrintWriter writer = response.getWriter();
	String requires = request.getParameter("requires");
	String code = request.getParameter("code");
	String source = request.getParameter("source");
	String name = request.getParameter("name");
	//ml
	String fileName = session.getServletContext().getRealPath("/")+"page/"+name+".js";
	String sourceFileName = session.getServletContext().getRealPath("/")+"source/"+name+".ml";
	File f = new File(fileName);
	File sf = new File(sourceFileName);
	
	if (!f.exists()){
		f.createNewFile();
	}
	if (!sf.exists()){
		sf.createNewFile();
	}
	FileWriter fw = new FileWriter(f);
	FileWriter sfw = new FileWriter(sf);
	
	StringBuffer sb = new StringBuffer();
	sb.append("$$.define(");
		sb.append(requires);
		sb.append(",");
		sb.append("function(){");
			sb.append("return ");
			sb.append(code);
			sb.append(";");
		sb.append("}");
	sb.append(");");
	
	fw.write(sb.toString(), 0, sb.length());
	fw.flush();
	
	sfw.write(source, 0, source.length());
	sfw.flush();
	
	fw.close();
	sfw.close();
	
	writer.write("success");
	writer.close();
%>